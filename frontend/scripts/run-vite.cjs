/**
 * Finds the vite binary via Node's module resolution (handles workspace hoisting)
 * and pre-loads the Windows net-use shim before running vite.
 *
 * Usage: node ./scripts/run-vite.cjs [vite args...]
 */
'use strict';

const path = require('path');

// Apply the Windows net-use shim before vite loads anything
require('./vite-net-use-shim.cjs');

// Resolve vite's package root from wherever npm installed it (hoisted or local)
let viteBin;
try {
  viteBin = path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
} catch (e) {
  process.stderr.write('run-vite: could not resolve vite — is it installed?\n');
  process.exit(1);
}

// Forward all CLI args to vite
process.argv.splice(1, 1, viteBin);
require(viteBin);
