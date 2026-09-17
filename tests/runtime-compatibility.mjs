import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalizePhoneNumber, SimulatorPhoneNavItem } from '@signalsafe/simulator-device';

const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync(resolve(dirname(require.resolve('@signalsafe/simulator-device')), '../package.json'), 'utf8'));
assert.equal(manifest.version, '0.16.3');
assert.equal(manifest.engines.node, '>=19.0.0');
assert.equal(normalizePhoneNumber('+1 (202) 555-0123'), '12025550123');
assert.equal(normalizePhoneNumber(null), '');
const html = renderToStaticMarkup(React.createElement(SimulatorPhoneNavItem, { label: 'Contacts', active: true, onClick() {} }));
assert.match(html, /Contacts/);
assert.match(html, /aria-current="page"/);
assert.match(html, /<button/);

assert.equal(manifest.dependencies['@signalsafe/simulator-core'], '0.3.2');
assert.equal(manifest.dependencies['@signalsafe/simulator-react'], '0.16.3');
console.log(`Runtime compatibility passed on ${process.version}`);
