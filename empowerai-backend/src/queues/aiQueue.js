const { Queue, Worker, QueueEvents } = require('bullmq')
const IORedis = require('ioredis')
const logger = require('../utils/logger')

const QUEUE_NAME = 'ai-jobs'
const queueEnabled = process.env.ENABLE_AI_QUEUE === 'true' && !!process.env.REDIS_URL

let queue = null
let connection = null
let worker = null
let queueEvents = null
const processors = new Map()

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
  }

  return queue
}

function ensureWorker() {
  if (!queueEnabled || worker) return
  const redis = createConnection()

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const handler = processors.get(job.name)
      if (!handler) {
        throw new Error(`No processor registered for job: ${job.name}`)
      }
      logger.info('AI job received', { id: job.id, name: job.name })
      return handler(job.data)
    },
    { connection: redis }
  )

  queueEvents = new QueueEvents(QUEUE_NAME, { connection: redis })
  logger.info('AI queue worker started', { queue: QUEUE_NAME })
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

function registerAiProcessor(name, handler) {
  if (!processors.has(name)) {
    processors.set(name, handler)
  }
}

async function runAiTask(name, payload, handler, options = {}) {
  if (typeof handler === 'function') {
    registerAiProcessor(name, handler)
  }

  const workerEnabled = process.env.ENABLE_AI_QUEUE_WORKER === 'true'

  if (!queueEnabled) {
    if (!processors.get(name)) {
      throw new Error(`No processor registered for job: ${name}`)
    }
    return processors.get(name)(payload)
  }

  if (!workerEnabled) {
    if (!processors.get(name)) {
      throw new Error(`No processor registered for job: ${name}`)
    }
    logger.info('AI queue enabled but worker disabled; running task inline', { name })
    return processors.get(name)(payload)
  }

  initAiQueue()
  ensureWorker()

  const attempts = options.attempts ?? 2
  const backoff = options.backoff ?? { type: 'exponential', delay: 1000 }

  const job = await queue.add(name, payload, {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts,
    backoff,
    ...options,
  })

  const timeout = options.timeout || 30_000
  return job.waitUntilFinished(queueEvents, timeout)
}

async function getAiQueueHealth() {
  const workerEnabled = process.env.ENABLE_AI_QUEUE_WORKER === 'true'
  const redisUrlSet = !!process.env.REDIS_URL

  if (!queueEnabled) {
    return {
      enabled: false,
      workerEnabled,
      redisUrlSet
    }
  }

  initAiQueue()

  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed')
    return {
      enabled: true,
      workerEnabled,
      redisUrlSet,
      counts
    }
  } catch (error) {
    return {
      enabled: true,
      workerEnabled,
      redisUrlSet,
      counts: null,
      error: error.message
    }
  }
}

function isAiQueueEnabled() {
  return queueEnabled
}

module.exports = {
  initAiQueue,
  enqueueAiJob,
  registerAiProcessor,
  runAiTask,
  getAiQueueHealth,
  isAiQueueEnabled,
}
