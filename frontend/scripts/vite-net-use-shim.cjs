const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const originalExec = childProcess.exec;

childProcess.exec = function patchedExec(command, options, callback) {
  try {
    return originalExec.call(this, command, options, callback);
  } catch (error) {
    if (command !== "net use") {
      throw error;
    }

    // In some locked-down Windows environments, spawning `net.exe` throws synchronously (EPERM).
    // Vite uses `exec("net use")` only as an optimization for resolving mapped network drives.
    // If it's blocked, we can safely skip it and let Vite continue with native realpath behavior.
    if (typeof options === "function") {
      callback = options;
      options = undefined;
    }

    if (typeof callback === "function") {
      callback(error, "", "");
    }

    return {
      on() {
        return this;
      },
      stdout: null,
      stderr: null,
    };
  }
};

// In this Codex/CI environment, listing the real Windows home directory can be blocked (EPERM),
// but some tooling (Vite/esbuild) will opportunistically walk up parent directories and readdir
// along the way. When that happens, fail open by treating those directories as empty.
//
// This patch is intentionally narrow:
// - Only swallows EPERM/EACCES
// - Only for the OS home directory (and its parents, e.g. "C:\\Users\\<name>")
const blockedRoots = new Set(
  [os.homedir()]
    .filter(Boolean)
    .map((p) => path.resolve(p))
);

function shouldIgnoreReaddirError(dirPath, err) {
  if (!err || (err.code !== "EPERM" && err.code !== "EACCES")) return false;
  if (!dirPath) return false;

  let resolved;
  try {
    resolved = path.resolve(dirPath);
  } catch {
    return false;
  }

  for (const root of blockedRoots) {
    if (resolved === root || resolved.startsWith(root + path.sep)) return true;
  }
  return false;
}

const originalReaddirSync = fs.readdirSync.bind(fs);
fs.readdirSync = function patchedReaddirSync(dirPath, options) {
  try {
    return originalReaddirSync(dirPath, options);
  } catch (err) {
    if (shouldIgnoreReaddirError(dirPath, err)) return [];
    throw err;
  }
};

const originalReaddir = fs.readdir.bind(fs);
fs.readdir = function patchedReaddir(dirPath, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = undefined;
  }

  return originalReaddir(dirPath, options, (err, files) => {
    if (err && shouldIgnoreReaddirError(dirPath, err)) return callback(null, []);
    return callback(err, files);
  });
};

if (fs.promises?.readdir) {
  const originalPromisesReaddir = fs.promises.readdir.bind(fs.promises);
  fs.promises.readdir = async function patchedPromisesReaddir(dirPath, options) {
    try {
      return await originalPromisesReaddir(dirPath, options);
    } catch (err) {
      if (shouldIgnoreReaddirError(dirPath, err)) return [];
      throw err;
    }
  };
}
