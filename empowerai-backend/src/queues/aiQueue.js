const { Queue, Worker } = require('bullmq')
const IORedis = require('ioredis')
const logger = require('../utils/logger')

const QUEUE_NAME = 'ai-jobs'
const queueEnabled = process.env.ENABLE_AI_QUEUE === 'true' && !!process.env.REDIS_URL

let queue = null
let connection = null

function createConnection() {
  if (!connection) {
    connection = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  }
  return connection
}

function initAiQueue() {
  if (!queueEnabled) {
    logger.info('AI queue disabled', {
      enabled: queueEnabled,
      redisUrlSet: !!process.env.REDIS_URL,
    })
    return null
  }

  if (!queue) {
    const redis = createConnection()
    queue = new Queue(QUEUE_NAME, { connection: redis })
    logger.info('AI queue initialized', { queue: QUEUE_NAME })

    if (process.env.ENABLE_AI_QUEUE_WORKER === 'true') {
      new Worker(
        QUEUE_NAME,
        async (job) => {
          logger.info('AI job received', { id: job.id, name: job.name })
          return { ok: true }
        },
        { connection: redis }
      )
      logger.info('AI queue worker started', { queue: QUEUE_NAME })
    }
  }

  return queue
}

async function enqueueAiJob(name, payload, options = {}) {
  if (!queue) {
    return { enqueued: false, reason: 'queue-disabled' }
  }

  const job = await queue.add(name, payload, {
    removeOnComplete: 100,
    removeOnFail: 1000,
    ...options,
  })

  return { enqueued: true, id: job.id }
}

function isAiQueueEnabled() {
  return queueEnabled
}

module.exports = {
  initAiQueue,
  enqueueAiJob,
  isAiQueueEnabled,
}
