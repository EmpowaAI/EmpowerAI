/**
 * Job API Service
 * 
 * Integrates with real job board APIs to fetch live job opportunities
 * Supports multiple providers: Adzuna, Indeed, and others
 */

const axios = require('axios');
const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');

// API Configuration
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

const INDEED_PUBLISHER_ID = process.env.INDEED_PUBLISHER_ID;
const INDEED_API_URL = 'https://api.indeed.com/ads/apisearch';

/**
 * Fetch jobs from Adzuna API (South Africa)
 */
async function fetchAdzunaJobs() {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    logger.warn('Adzuna API credentials not configured');
    return [];
  }

  try {
    const results = [];
    const keywords = ['entry level', 'learnership', 'internship', 'graduate', 'junior'];
    
    for (const keyword of keywords) {
      try {
        const response = await axios.get(ADZUNA_BASE_URL + '/za/search/1', {
          params: {
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY,
            results_per_page: 50,
            what: keyword,
            content_type: 'job',
            sort_by: 'date'
          },
          timeout: 10000
        });

        if (response.data && response.data.results) {
          results.push(...response.data.results);
        }
      } catch (error) {
        logger.error(`Error fetching Adzuna jobs for keyword "${keyword}":`, error.message);
      }
    }

    return results.map(transformAdzunaJob);
  } catch (error) {
    logger.error('Error fetching Adzuna jobs:', error.message);
    return [];
  }
}

/**
 * Transform Adzuna job to Opportunity format
 */
function transformAdzunaJob(job) {
  const type = determineOpportunityType(job.title, job.description || '');
  const location = extractLocation(job.location?.display_name || job.location?.area || 'South Africa');
  const province = getProvinceFromLocation(location);
  
  return {
    title: job.title || 'Untitled Job',
    type: type,
    company: job.company?.display_name || 'Company Not Specified',
    location: location,
    province: province,
    description: cleanDescription(job.description || ''),
    requirements: [],
    skills: extractSkills(job.description || ''),
    salaryRange: job.salary_min && job.salary_max ? {
      min: job.salary_min,
      max: job.salary_max
    } : null,
    deadline: job.created ? new Date(job.created) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    applicationUrl: job.redirect_url || job.url || '',
    isActive: true,
    source: 'adzuna',
    externalId: job.id?.toString()
  };
}

/**
 * Fetch jobs from Indeed API (if available)
 */
async function fetchIndeedJobs() {
  if (!INDEED_PUBLISHER_ID) {
    logger.warn('Indeed API credentials not configured');
    return [];
  }

  try {
    const response = await axios.get(INDEED_API_URL, {
      params: {
        publisher: INDEED_PUBLISHER_ID,
        q: 'entry level OR learnership OR internship',
        l: 'south africa',
        sort: 'date',
        radius: 25,
        limit: 50,
        format: 'json',
        v: 2
      },
      timeout: 10000
    });

    if (response.data && response.data.results) {
      return response.data.results.map(transformIndeedJob);
    }

    return [];
  } catch (error) {
    logger.error('Error fetching Indeed jobs:', error.message);
    return [];
  }
}

/**
 * Transform Indeed job to Opportunity format
 */
function transformIndeedJob(job) {
  const type = determineOpportunityType(job.jobtitle, job.snippet || '');
  const location = extractLocation(job.formattedLocation || job.city || 'South Africa');
  const province = getProvinceFromLocation(location);
  
  return {
    title: job.jobtitle || 'Untitled Job',
    type: type,
    company: job.company || 'Company Not Specified',
    location: location,
    province: province,
    description: cleanDescription(job.snippet || ''),
    requirements: [],
    skills: extractSkills(job.snippet || ''),
    salaryRange: null, // Indeed API doesn't always provide salary
    deadline: job.date ? new Date(job.date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationUrl: job.url || job.link || '',
    isActive: true,
    source: 'indeed',
    externalId: job.jobkey
  };
}

/**
 * Fetch all jobs from configured APIs
 */
async function fetchAllJobAPIs() {
  logger.info('Starting job API aggregation...');
  
  const allJobs = [];
  
  // Fetch from Adzuna
  try {
    const adzunaJobs = await fetchAdzunaJobs();
    logger.info(`Fetched ${adzunaJobs.length} jobs from Adzuna`);
    allJobs.push(...adzunaJobs);
  } catch (error) {
    logger.error('Error fetching from Adzuna:', error.message);
  }
  
  // Fetch from Indeed
  try {
    const indeedJobs = await fetchIndeedJobs();
    logger.info(`Fetched ${indeedJobs.length} jobs from Indeed`);
    allJobs.push(...indeedJobs);
  } catch (error) {
    logger.error('Error fetching from Indeed:', error.message);
  }
  
  return allJobs;
}

/**
 * Save jobs to database with deduplication
 */
async function saveJobsToDatabase(jobs) {
  let newCount = 0;
  let skippedCount = 0;
  
  for (const job of jobs) {
    try {
      // Check for duplicates by externalId or title+company+location
      const existing = await Opportunity.findOne({
        $or: [
          { externalId: job.externalId, source: job.source },
          {
            title: new RegExp(job.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
            company: job.company,
            location: job.location
          }
        ]
      });
      
      if (existing) {
        skippedCount++;
        continue;
      }
      
      await Opportunity.create(job);
      newCount++;
    } catch (error) {
      if (error.code === 11000) {
        skippedCount++;
      } else {
        logger.error(`Error saving job "${job.title}":`, error.message);
        skippedCount++;
      }
    }
  }
  
  return { new: newCount, skipped: skippedCount };
}

/**
 * Fetch and save jobs from all APIs
 */
async function fetchAndSaveJobs() {
  try {
    const jobs = await fetchAllJobAPIs();
    logger.info(`Total jobs fetched: ${jobs.length}`);
    
    if (jobs.length === 0) {
      logger.warn('No jobs fetched from any API');
      return { new: 0, skipped: 0, total: 0 };
    }
    
    const result = await saveJobsToDatabase(jobs);
    logger.info(`Job API aggregation complete: ${result.new} new, ${result.skipped} skipped`);
    
    return {
      ...result,
      total: jobs.length
    };
  } catch (error) {
    logger.error('Error in fetchAndSaveJobs:', error);
    throw error;
  }
}

// Helper functions (reused from RSS service)
function determineOpportunityType(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('learnership')) return 'learnership';
  if (text.includes('bursary') || text.includes('scholarship')) return 'bursary';
  if (text.includes('internship')) return 'internship';
  if (text.includes('freelance') || text.includes('remote') || text.includes('contract')) return 'freelance';
  return 'job';
}

function extractLocation(text) {
  const locations = [
    'johannesburg', 'cape town', 'durban', 'pretoria',
    'port elizabeth', 'east london', 'bloemfontein',
    'nelspruit', 'polokwane', 'kimberley', 'rustenburg'
  ];
  
  const lowerText = text.toLowerCase();
  for (const loc of locations) {
    if (lowerText.includes(loc)) {
      return loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  
  return 'South Africa';
}

function getProvinceFromLocation(location) {
  const provinceMap = {
    'johannesburg': ['Gauteng'],
    'pretoria': ['Gauteng'],
    'cape town': ['Western Cape'],
    'durban': ['KwaZulu-Natal'],
    'port elizabeth': ['Eastern Cape'],
    'east london': ['Eastern Cape'],
    'bloemfontein': ['Free State'],
    'nelspruit': ['Mpumalanga'],
    'polokwane': ['Limpopo'],
    'kimberley': ['Northern Cape'],
    'rustenburg': ['North West'],
    'remote': ['Nationwide']
  };
  
  const loc = location.toLowerCase();
  for (const [key, provinces] of Object.entries(provinceMap)) {
    if (loc.includes(key)) {
      return provinces;
    }
  }
  
  return ['Gauteng'];
}

function extractSkills(description) {
  if (!description) return [];
  
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'Communication', 'Problem Solving', 'Teamwork', 'Leadership',
    'Excel', 'Word', 'PowerPoint', 'Customer Service', 'Sales',
    'Marketing', 'Accounting', 'Finance', 'Project Management',
    'Agile', 'Scrum', 'Git', 'Docker', 'AWS', 'Azure'
  ];
  
  const foundSkills = [];
  const descLower = description.toLowerCase();
  
  for (const skill of commonSkills) {
    if (descLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }
  
  return foundSkills.slice(0, 10);
}

function cleanDescription(description) {
  if (!description) return '';
  let cleaned = description.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned.substring(0, 2000);
}

module.exports = {
  fetchAndSaveJobs,
  fetchAdzunaJobs,
  fetchIndeedJobs
};
