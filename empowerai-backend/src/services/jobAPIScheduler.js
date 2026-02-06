/**
 * Job API Scheduler Service
 * 
 * Automatically fetches real opportunities from Adzuna and Indeed APIs
 * Runs on a schedule (configurable interval)
 * 
 * Configuration:
 *   ENABLE_JOB_API_SCHEDULER=true
 *   JOB_API_FETCH_INTERVAL=120  // minutes (default: every 2 hours)
 */

const axios = require('axios');
const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');

let schedulerInterval = null;
let isRunning = false;

/**
 * Start the job API scheduler
 */
function startJobAPIScheduler() {
  const enabled = process.env.ENABLE_JOB_API_SCHEDULER !== 'false';
  
  if (!enabled) {
    logger.info('Job API scheduler is disabled');
    return;
  }

  // Check if APIs are configured
  const adzunaConfigured = process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY;
  const indeedConfigured = process.env.INDEED_PUBLISHER_ID;

  if (!adzunaConfigured && !indeedConfigured) {
    logger.warn('Job API scheduler not started: No job APIs configured');
    logger.info('To enable: Set ADZUNA_APP_ID, ADZUNA_APP_KEY or INDEED_PUBLISHER_ID');
    return;
  }

  // Interval in minutes (default: 120 = every 2 hours)
  const intervalMinutes = parseInt(process.env.JOB_API_FETCH_INTERVAL || '120');
  const intervalMs = intervalMinutes * 60 * 1000;

  logger.info(`Job API scheduler starting - fetch interval: ${intervalMinutes} minutes`);

  // Fetch immediately on startup
  logger.info('Fetching real opportunities on startup...');
  fetchRealOpportunities();

  // Then schedule recurring fetches
  schedulerInterval = setInterval(() => {
    logger.info('Running scheduled job API fetch...');
    fetchRealOpportunities();
  }, intervalMs);

  logger.info(`✅ Job API scheduler initialized - will fetch every ${intervalMinutes} minutes`);
}

/**
 * Stop the scheduler
 */
function stopJobAPIScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('Job API scheduler stopped');
  }
}

/**
 * Main function to fetch opportunities
 */
async function fetchRealOpportunities() {
  if (isRunning) {
    logger.warn('Job API fetch already in progress, skipping...');
    return;
  }

  isRunning = true;

  try {
    let totalAdded = 0;
    let totalSkipped = 0;

    // Fetch from Adzuna
    if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
      try {
        logger.info('Fetching opportunities from Adzuna...');
        const { fetchAdzunaJobs } = require('./jobAPIService');
        const jobs = await fetchAdzunaJobs();
        
        const result = await saveOpportunities(jobs, 'adzuna');
        totalAdded += result.added;
        totalSkipped += result.skipped;
        
        logger.info(`Adzuna fetch complete: ${result.added} added, ${result.skipped} skipped`);
      } catch (error) {
        logger.error('Error fetching from Adzuna:', error.message);
      }
    }

    // Fetch from Indeed
    if (process.env.INDEED_PUBLISHER_ID) {
      try {
        logger.info('Fetching opportunities from Indeed...');
        const { fetchIndeedJobs } = require('./jobAPIService');
        const jobs = await fetchIndeedJobs();
        
        const result = await saveOpportunities(jobs, 'indeed');
        totalAdded += result.added;
        totalSkipped += result.skipped;
        
        logger.info(`Indeed fetch complete: ${result.added} added, ${result.skipped} skipped`);
      } catch (error) {
        logger.error('Error fetching from Indeed:', error.message);
      }
    }

    // Log overall results
    logger.info(`Job API fetch complete: ${totalAdded} opportunities added, ${totalSkipped} skipped`);

  } catch (error) {
    logger.error('Fatal error in job API fetch:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Save opportunities to database
 */
async function saveOpportunities(jobs, source) {
  let added = 0;
  let skipped = 0;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return { added, skipped };
  }

  for (const job of jobs) {
    try {
      // Check for duplicates
      const existing = await Opportunity.findOne({
        externalId: job.externalId,
        source: source
      });

      if (!existing) {
        await Opportunity.create({
          ...job,
          source: source,
          isActive: true
        });
        added++;
      } else {
        skipped++;
      }
    } catch (error) {
      logger.warn(`Error saving opportunity: ${error.message}`);
    }
  }

  return { added, skipped };
}

module.exports = {
  startJobAPIScheduler,
  stopJobAPIScheduler,
  fetchRealOpportunities
};
