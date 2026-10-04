import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const artifactRoot = resolve(root, 'vendor/npm');

function isInside(base, candidate) {
    const path = relative(base, candidate);
    return path !== '' && !path.startsWith('..') && !isAbsolute(path);
}

const requested = process.argv[2];
if (!requested) throw new Error('Provide the runtime artifact destination directory.');
const target = resolve(requested);
const allowedRoots = [process.cwd(), tmpdir(), process.env.RUNNER_TEMP]
    .filter(Boolean)
    .map((directory) => resolve(directory));
if (!allowedRoots.some((directory) => isInside(directory, target))) {
    throw new Error('The destination must be inside the working directory or a temporary directory.');
}
mkdirSync(target, { recursive: true });

const manifest = resolve(artifactRoot, 'manifest.json');
if (existsSync(manifest)) {
    for (const file of Object.keys(JSON.parse(readFileSync(manifest, 'utf8')))) {
        const source = resolve(root, file);
        if (!isInside(artifactRoot, source)) throw new Error(`Artifact is outside vendor/npm: ${file}`);
        copyFileSync(source, resolve(target, basename(file)));
    }
}
