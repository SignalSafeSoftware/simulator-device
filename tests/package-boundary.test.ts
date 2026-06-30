import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function listSourceFiles(dir: string): string[] {
    const entries = readdirSync(dir);
    const files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            files.push(...listSourceFiles(fullPath));
        } else if (/\.(ts|tsx)$/.test(entry)) {
            files.push(fullPath);
        }
    }
    return files;
}

describe('package boundaries', () => {
    it('has no DeliveryPlus, Bootstrap, or Material imports in source', () => {
        const forbidden = [
            /from ['"]@shared\//,
            /from ['"]@\/shared\//,
            /DeliveryPlus/,
            /bootstrap/,
            /@mui\//,
            /material-ui/,
            /MutationObserver/,
        ];

        const violations: string[] = [];
        for (const file of listSourceFiles(path.join(packageRoot, 'src'))) {
            const content = readFileSync(file, 'utf8');
            for (const pattern of forbidden) {
                if (pattern.test(content)) {
                    violations.push(`${path.relative(packageRoot, file)}: ${pattern}`);
                }
            }
        }

        expect(violations).toEqual([]);
    });

    it('does not ship CSS side effects', () => {
        const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as {
            sideEffects: boolean;
        };
        expect(pkg.sideEffects).toBe(false);
    });
});
