const childProcess = require("node:child_process");

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

