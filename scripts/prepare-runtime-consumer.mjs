import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
// Absolute path so a writable PATH entry cannot substitute the archive tool.
const tar = ['/usr/bin/tar', '/bin/tar'].find((candidate) => existsSync(candidate));
if (!tar) throw new Error('tar was not found in a system directory.');
const [artifacts, consumer] = process.argv.slice(2);
if (!artifacts || !consumer) throw new Error('Provide artifact and consumer directories.');
const dependencies = Object.fromEntries(readdirSync(artifacts).filter(file => file.endsWith('.tgz')).map(file => {
    const tarball = resolve(artifacts, file);
    const manifest = JSON.parse(execFileSync(tar, ['-xOf', tarball, 'package/package.json'], { encoding: 'utf8' }));
    return [manifest.name, `file:${tarball}`];
}));
mkdirSync(consumer, { recursive: true });
writeFileSync(resolve(consumer, 'package.json'), JSON.stringify({
    name: 'simulator-runtime-consumer', private: true, type: 'module', dependencies,
    overrides: Object.fromEntries(Object.keys(dependencies).map(name => [name, `$${name}`])),
}, null, 2));
