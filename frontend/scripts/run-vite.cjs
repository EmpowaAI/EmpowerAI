'use strict';
/**
 * Finds the vite binary via Node module resolution (handles workspace hoisting),
 * then spawns it with the Windows net-use shim pre-loaded via --require.
 *
 * Using spawnSync instead of require() because vite's bin/vite.js is ESM with
 * top-level await and cannot be require()'d from a CJS module.
 *
 * Usage: node ./scripts/run-vite.cjs [vite args...]
 */
const path = require('path');
const { spawnSync } = require('child_process');

let viteBin;
try {
  viteBin = path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
} catch (e) {
  process.stderr.write('run-vite: could not resolve vite — is it installed?\n');
  process.exit(1);
}

const shimPath = path.resolve(__dirname, 'vite-net-use-shim.cjs');
const viteArgs = process.argv.slice(2);

const result = spawnSync(
  process.execPath,
  ['--require', shimPath, viteBin, ...viteArgs],
  { stdio: 'inherit', env: process.env }
);

process.exit(result.status ?? 1);
