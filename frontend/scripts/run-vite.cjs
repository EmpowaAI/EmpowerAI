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
const fs = require('fs');
const { spawnSync } = require('child_process');

let viteBin;
try {
  viteBin = path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
} catch (e) {
  process.stderr.write('run-vite: could not resolve vite - is it installed?\n');
  process.exit(1);
}

const shimPath = path.resolve(__dirname, 'vite-net-use-shim.cjs');
const viteArgs = process.argv.slice(2);

function runVite(cwd) {
  return spawnSync(
    process.execPath,
    ['--require', shimPath, viteBin, ...viteArgs],
    { stdio: 'inherit', env: process.env, cwd }
  );
}

function isParentDirectoryReadDenied() {
  if (process.platform !== 'win32') return false;
  try {
    fs.readdirSync(path.resolve(process.cwd(), '../../..'));
    return false;
  } catch (err) {
    return err && (err.code === 'EPERM' || err.code === 'EACCES');
  }
}

function pickSubstDriveLetter() {
  const preferred = ['X', 'Y', 'Z', 'W', 'V'];
  const used = new Set(
    Object.keys(process.env)
      .filter((k) => k.length === 2 && k[1] === ':')
      .map((k) => k[0].toUpperCase())
  );

  for (const letter of preferred) {
    if (!used.has(letter)) return letter;
  }
  for (let code = 'Z'.charCodeAt(0); code >= 'D'.charCodeAt(0); code--) {
    const letter = String.fromCharCode(code);
    if (!used.has(letter)) return letter;
  }
  return null;
}

function withSubstDrive(fn) {
  const driveLetter = pickSubstDriveLetter();
  if (!driveLetter) return null;

  const drive = `${driveLetter}:`;
  const target = path.resolve(__dirname, '../..'); // monorepo root
  const frontendDir = path.resolve(__dirname, '..'); // frontend/
  const frontendRel = path.relative(target, frontendDir);

  const create = spawnSync('subst', [drive, target], { stdio: 'ignore' });
  if ((create.status ?? 1) !== 0) return null;

  try {
    const substFrontendCwd = path.join(`${drive}\\`, frontendRel);
    return fn(substFrontendCwd);
  } finally {
    spawnSync('subst', [drive, '/D'], { stdio: 'ignore' });
  }
}

let result;

// In some locked-down Windows environments, esbuild (used by Vite to load config) walks
// up parent directories and fails with EPERM/EACCES. Preemptively run under a temporary
// SUBST drive so parent traversal stays within the virtual drive root.
if (isParentDirectoryReadDenied()) {
  result = withSubstDrive((substCwd) => runVite(substCwd));
}

if (!result) {
  result = runVite(process.cwd());
}

process.exit(result.status ?? 1);
