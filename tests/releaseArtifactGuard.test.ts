import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

function checkReleaseLock(lock: string) {
    const directory = mkdtempSync(join(tmpdir(), 'device-release-guard-'));
    try {
        const scripts = join(directory, 'scripts');
        mkdirSync(scripts);
        const script = join(scripts, 'check-package-artifacts.mjs');
        copyFileSync(
            join(dirname(fileURLToPath(import.meta.url)), '../scripts/check-package-artifacts.mjs'),
            script,
        );
        writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: 'guard-fixture' }));
        writeFileSync(join(directory, 'yarn.lock'), lock);
        return spawnSync(process.execPath, [script, '--release'], {
            encoding: 'utf8',
            timeout: 5000,
        });
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
}

it.each([
    '  resolved "file:vendor/package.tgz"',
    '\tresolved "link:../package"',
    ' \t resolved "file:../package"\r\n',
])('rejects a local artifact resolution with supported Yarn indentation: %j', (line) => {
    const result = checkReleaseLock(line);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Release lockfile must resolve registry artifacts');
});

it('accepts registry resolutions after a large whitespace-only prefix without backtracking', () => {
    const result = checkReleaseLock(
        '\n '.repeat(50000) + '\n  resolved "https://registry.npmjs.org/example.tgz"\n',
    );
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Verified 0 local artifacts');
});
