import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
);
const lockfile = fs.readFileSync(path.join(rootDir, 'pnpm-lock.yaml'), 'utf8');
const scripts = packageJson.scripts ?? {};

assert.match(
  packageJson.packageManager || '',
  /^pnpm@7\./,
  'Expected packageManager to pin a pnpm 7.x release',
);

assert.equal(
  packageJson.devDependencies?.['@wxt-dev/module-react'],
  '1.1.5',
  'Expected @wxt-dev/module-react to be pinned to 1.1.5',
);

assert.match(
  lockfile,
  /\/@vitejs\/plugin-react\/5\.1\.1:/,
  'Expected pnpm-lock.yaml to resolve @vitejs/plugin-react to 5.1.1',
);

assert.match(
  lockfile,
  /'@wxt-dev\/module-react': 1\.1\.5_wxt@0\.19\.29/,
  'Expected pnpm-lock.yaml to resolve @wxt-dev/module-react to 1.1.5',
);

for (const scriptName of [
  'dev',
  'dev:firefox',
  'build',
  'build:firefox',
  'zip',
  'zip:firefox',
]) {
  assert.doesNotMatch(
    scripts[scriptName] || '',
    /\bpnpm\b/,
    `Expected ${scriptName} to avoid nested pnpm calls so Corepack-only environments work`,
  );
}
