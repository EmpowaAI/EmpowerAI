const logger = require('../utils/logger');

const queue = [];
let running = false;

function enqueueCvTask(task) {
  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (running) return;
  running = true;

  while (queue.length > 0) {
    const { task, resolve, reject } = queue.shift();
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }

  running = false;
}

function getQueueSize() {
  return queue.length + (running ? 1 : 0);
}

module.exports = {
  enqueueCvTask,
  getQueueSize
};
