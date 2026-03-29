/**
 * RSS Feed Service
 * 
 * Fetches and parses RSS feeds from South African job boards
 * and transforms them into Opportunity format for our database.
 */

const Parser = require('rss-parser');
const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');
const { extractSkillsEnhanced } = require('../utils/skillExtractors');

const parser = new Parser({
  timeout: 30000, // increased timeout for slow feeds
  maxRedirects: 5,
  customFields: {
    item: [
      ['salary', 'salary'],
      ['company', 'company'],
      ['location', 'location'],
      ['jobType', 'jobType'],
      ['dc:creator', 'creator'],
      ['himalayasJobs:companyName', 'companyName'],
      ['himalayasJobs:locationRestriction', 'locationRestriction'],
      ['himalayasJobs:timezoneRestriction', 'timezoneRestriction'],
      ['himalayasJobs:category', 'category']
    ]
  }
});

// RSS Feed Sources - Real South African Job Boards
// Using verified working RSS feed URLs
const FEED_SOURCES = [
  {
    name: 'Himalayas Remote Jobs',
    url: 'https://himalayas.app/jobs/rss',
    type: 'job',
    transform: transformRemoteGenericFeed
  },
  {
    name: 'We Work Remotely',
    url: 'https://weworkremotely.com/remote-jobs.rss',
    type: 'job',
    transform: transformRemoteGenericFeed
  },
  {
    name: 'Empllo Remote Jobs',
    url: 'https://empllo.com/feeds/remote-jobs.rss',
    type: 'job',
    transform: transformRemoteGenericFeed
  },
  {
    name: 'WorkAnywhere Remote Jobs',
    url: 'https://workanywhere.pro/rss.xml',
    type: 'job',
    transform: transformRemoteGenericFeed
  },
  {
    name: 'Real Work From Anywhere',
    url: 'https://www.realworkfromanywhere.com/rss.xml',
    type: 'job',
    transform: transformRemoteGenericFeed
  },
  {
    name: 'JobsCollider Remote Jobs',
    url: 'https://jobscollider.com/remote-jobs.rss',
    type: 'job',
    transform: transformRemoteGenericFeed
  }
];

/**
 * Main function to fetch and process all RSS feeds
 */
async function fetchAllFeeds() {
  logger.info('Starting RSS feed aggregation...');
  let totalNew = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Process each feed source
  // Using Promise.allSettled ensures one failed feed doesn't reject the whole aggregation
  await Promise.allSettled(FEED_SOURCES.map(async (source) => {
    try {
      logger.info(`Fetching feed: ${source.name} (${source.url})`);
      const feed = await parser.parseURL(source.url);
      
      if (!feed || !feed.items || feed.items.length === 0) {
        logger.warn(`No items found in feed: ${source.name}`);
        return;
      }

      logger.info(`Found ${feed.items.length} items in ${source.name} feed`);

      let newCount = 0;
      let skippedCount = 0;

      for (const item of feed.items) {
        try {
          const opportunity = await source.transform(item, source);
          
          if (!opportunity) {
            skippedCount++;
            continue;
          }

          // Deduplication: Check if opportunity already exists
          const existing = await findExistingOpportunity(opportunity);
          
          if (existing) {
            skippedCount++;
            continue;
          }

          // Save new opportunity
          try {
            const saved = await Opportunity.create(opportunity);
            newCount++;
            logger.debug(`Saved new opportunity: ${saved.title} from ${source.name}`);
          } catch (saveError) {
            // Handle duplicate key errors or validation errors
            if (saveError.code === 11000) {
              // Duplicate key error (if we have unique indexes)
              skippedCount++;
              logger.debug(`Duplicate opportunity skipped: ${opportunity.title}`);
            } else {
              logger.error(`Error saving opportunity: ${saveError.message}`);
              skippedCount++;
            }
          }

        } catch (itemError) {
          logger.error(`Error processing item from ${source.name}:`, itemError.message);
          skippedCount++;
        }
      }

      totalNew += newCount;
      totalSkipped += skippedCount;
      logger.info(`Processed ${source.name}: ${newCount} new, ${skippedCount} skipped`);

    } catch (error) {
      totalErrors++;
      logger.error(`Error fetching feed ${source.name}:`, error.message);
      // Continue with other feeds even if one fails
    }
  }
  ));

  logger.info(`RSS aggregation complete: ${totalNew} new, ${totalSkipped} skipped, ${totalErrors} errors`);
  return { new: totalNew, skipped: totalSkipped, errors: totalErrors };
}


/** 
 * Manual perge of old opportunities
 * Remove opportunities older than 30 days.
  */
async function purgeOldOpportunities(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  try {
    const results = await Opportunity.deleteMany({ createdAt: { $lt: cutoffDate } });
    logger.info(`Purged old opportunities older than ${daysOld} days: ${results.deletedCount} removed.`);
    return results.deletedCount;
  } catch (error) {
    logger.error('Error purging old opportunities:', error.message);
    throw error;
  }
}

/**
 * Find existing opportunity by title, company, and link
 */
async function findExistingOpportunity(opportunity) {
  // Try multiple strategies for deduplication
  const escapedTitle = opportunity.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const queries = [
    { applicationUrl: opportunity.applicationUrl },
    { 
      title: { $regex: `^${escapedTitle}$`, $options: 'i' },
      company: opportunity.company
    }
  ];

  for (const query of queries) {
    const existing = await Opportunity.findOne(query);
    if (existing) {
      return existing;
    }
  }

  return null;
}

/**
 * Transform Indeed RSS item to Opportunity format
 */
function transformIndeedFeed(item, source) {
  try {
    const title = item.title || 'Untitled Job';
    const description = item.contentSnippet || item.content || '';
    const link = item.link || item.guid;
    
    if (!link || !title) {
      return null;
    }

    // Extract location from title or description
    const locationMatch = (item.title + ' ' + description).match(/(Johannesburg|Cape Town|Durban|Pretoria|Port Elizabeth|East London|Bloemfontein|Nelspruit|Polokwane|Kimberley)/i);
    const location = locationMatch ? locationMatch[1] : 'South Africa';

    // Extract company from title or try to parse from description
    let company = extractCompany(description) || 'Company Not Specified';

    // Determine province from location
    const province = getProvinceFromLocation(location);

    // Extract skills from description
    const skills = extractSkillsEnhanced(description);

    // Determine type from title/description
    const type = determineOpportunityType(title, description);

    // Extract salary if mentioned
    const salaryRange = extractSalaryRange(description);

    return {
      title: cleanTitle(title),
      type: type,
      company: company,
      location: location,
      province: province,
      description: cleanDescription(description),
      requirements: [],
      skills: skills,
      salaryRange: salaryRange,
      deadline: item.pubDate ? new Date(item.pubDate) : new Date(),
      applicationUrl: link,
      isActive: true
    };
  } catch (error) {
    logger.error('Error transforming Indeed feed item:', error);
    return null;
  }
}

/**
 * Transform Careers24 RSS item to Opportunity format
 */
function transformCareers24Feed(item, source) {
  try {
    const title = item.title || 'Untitled Job';
    const description = item.contentSnippet || item.content || '';
    const link = item.link || item.guid;
    
    if (!link || !title) {
      return null;
    }

    const location = extractLocation(item.title, description) || 'South Africa';
    const company = extractCompany(description) || 'Company Not Specified';
    const province = getProvinceFromLocation(location);
    const skills = extractSkillsEnhanced(description);
    const type = determineOpportunityType(title, description);
    const salaryRange = extractSalaryRange(description);

    return {
      title: cleanTitle(title),
      type: type,
      company: company,
      location: location,
      province: province,
      description: cleanDescription(description),
      requirements: [],
      skills: skills,
      salaryRange: salaryRange,
      deadline: item.pubDate ? new Date(item.pubDate) : new Date(),
      applicationUrl: link,
      isActive: true
    };
  } catch (error) {
    logger.error('Error transforming Careers24 feed item:', error);
    return null;
  }
}

/**
 * Transform RemoteOk RSS item (for remote/freelance work)
 */
function transformRemoteOkFeed(item, source) {
  try {
    const title = item.title || 'Untitled Job';
    const description = item.contentSnippet || item.content || '';
    const link = item.link || item.guid;
    
    if (!link || !title) {
      return null;
    }

    // For remote work, set location to "Remote"
    const company = extractCompany(description) || 'Remote Company';
    const skills = extractSkillsEnhanced(description);
    const salaryRange = extractSalaryRange(description);

    return {
      title: cleanTitle(title),
      type: 'freelance',
      company: company,
      location: 'Remote',
      province: ['Nationwide'],
      description: cleanDescription(description),
      requirements: [],
      skills: skills,
      salaryRange: salaryRange,
      deadline: item.pubDate ? new Date(item.pubDate) : new Date(),
      applicationUrl: link,
      isActive: true
    };
  } catch (error) {
    logger.error('Error transforming RemoteOk feed item:', error);
    return null;
  }
}

/**
 * Transform MyJobMag RSS item to Opportunity format
 */
function transformMyJobMagFeed(item, source) {
  try {
    const title = item.title || 'Untitled Job';
    const description = item.contentSnippet || item.content || item.description || '';
    const link = item.link || item.guid || '';
    
    if (!link || !title) {
      return null;
    }

    // Extract location from title or description
    const location = extractLocation(item.title, description) || 'South Africa';

    // Extract company from description or title
    let company = extractCompany(description) || extractCompany(item.title) || 'Company Not Specified';

    // Determine province from location
    const province = getProvinceFromLocation(location);

    // Extract skills from description
    const skills = extractSkillsEnhanced(description);

    // Determine type from source or description
    let type = source.type || determineOpportunityType(title, description);

    // Extract salary if mentioned
    const salaryRange = extractSalaryRange(description);

    // Extract deadline if mentioned in description
    let deadline = item.pubDate ? new Date(item.pubDate) : new Date();
    const deadlineMatch = description.match(/(deadline|closing|apply by)[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i);
    if (deadlineMatch && deadlineMatch[2]) {
      try {
        deadline = new Date(deadlineMatch[2]);
      } catch (e) {
        // Keep default deadline
      }
    }

    return {
      title: cleanTitle(title),
      type: type,
      company: company,
      location: location,
      province: province,
      description: cleanDescription(description),
      requirements: [],
      skills: skills,
      salaryRange: salaryRange,
      deadline: deadline,
      applicationUrl: link,
      isActive: true
    };
  } catch (error) {
    logger.error('Error transforming MyJobMag feed item:', error);
    return null;
  }
}

/**
 * Transform CareerJet RSS item to Opportunity format
 */
function transformCareerJetFeed(item, source) {
  try {
    const title = item.title || 'Untitled Job';
    const description = item.contentSnippet || item.content || item.description || '';
    const link = item.link || item.guid || '';
    
    if (!link || !title) {
      return null;
    }

    const location = extractLocation(item.title, description) || 'South Africa';
    const company = extractCompany(description) || extractCompany(item.title) || 'Company Not Specified';
    const province = getProvinceFromLocation(location);
    const skills = extractSkillsEnhanced(description);
    const type = determineOpportunityType(title, description);
    const salaryRange = extractSalaryRange(description);

    return {
      title: cleanTitle(title),
      type: type,
      company: company,
      location: location,
      province: province,
      description: cleanDescription(description),
      requirements: [],
      skills: skills,
      salaryRange: salaryRange,
      deadline: item.pubDate ? new Date(item.pubDate) : new Date(),
      applicationUrl: link,
      isActive: true
    };
  } catch (error) {
    logger.error('Error transforming CareerJet feed item:', error);
    return null;
  }
}

/**
 * Transform AllJobs.co.za RSS item to Opportunity format
 */
function transformAllJobsFeed(item, source) {
  try {
    const title = item.title || 'Untitled Job';
    const description = item.contentSnippet || item.content || item.description || '';
    const link = item.link || item.guid || '';
    
    if (!link || !title) {
      return null;
    }

    const location = extractLocation(item.title, description) || 'South Africa';
    const company = extractCompany(description) || extractCompany(item.title) || 'Company Not Specified';
    const province = getProvinceFromLocation(location);
    const skills = extractSkillsEnhanced(description);
    const type = determineOpportunityType(title, description);
    const salaryRange = extractSalaryRange(description);

    return {
      title: cleanTitle(title),
      type: type,
      company: company,
      location: location,
      province: province,
      description: cleanDescription(description),
      requirements: [],
      skills: skills,
      salaryRange: salaryRange,
      deadline: item.pubDate ? new Date(item.pubDate) : new Date(),
      applicationUrl: link,
      isActive: true
    };
  } catch (error) {
    logger.error('Error transforming AllJobs feed item:', error);
    return null;
  }
}

/**
 * Generic transform for remote/global RSS feeds
 */
function transformRemoteGenericFeed(item, source) {
  try {
    const title = item.title || 'Untitled Job';
    const description = item.contentSnippet || item.content || item.description || '';
    const link = item.link || item.guid || '';

    if (!link || !title) {
      return null;
    }

    const company =
      item.companyName ||
      item.creator ||
      item.author ||
      extractCompany(description) ||
      'Company Not Specified';

    const location = item.locationRestriction || 'Remote';
    const province = ['Nationwide'];
    const skills = extractSkillsEnhanced(description);
    const type = determineOpportunityType(title, description);
    const salaryRange = extractSalaryRange(description);

    return {
      title: cleanTitle(title),
      type: type,
      company: company,
      location: location,
      province: province,
      description: cleanDescription(description),
      requirements: [],
      skills: skills,
      salaryRange: salaryRange,
      deadline: item.pubDate ? new Date(item.pubDate) : new Date(),
      applicationUrl: link,
      isActive: true,
      source: 'rss'
    };
  } catch (error) {
    logger.error('Error transforming remote feed item:', error);
    return null;
  }
}

/**
 * Helper: Extract company name from description
 */
function extractCompany(text) {
  if (!text) return null;
  
  // Common patterns
  const patterns = [
    /company[:\s]+([A-Z][a-zA-Z\s&]+)/i,
    /at\s+([A-Z][a-zA-Z\s&]+)/i,
    /([A-Z][a-zA-Z\s&]{2,})\s+(Pty|Ltd|Limited|Inc)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 100);
    }
  }

  return null;
}

/**
 * Helper: Extract location from text
 */
function extractLocation(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  const locations = [
    'johannesburg', 'cape town', 'durban', 'pretoria', 
    'port elizabeth', 'east london', 'bloemfontein',
    'nelspruit', 'polokwane', 'kimberley', 'rustenburg'
  ];

  for (const loc of locations) {
    if (text.includes(loc)) {
      return loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  return null;
}

/**
 * Helper: Map location to province
 */
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

  return ['Gauteng']; // Default
}

/**
 * Helper: Extract skills from description
 */
/**
 * Helper: Determine opportunity type from title/description
 */
function determineOpportunityType(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('learnership')) return 'learnership';
  if (text.includes('bursary') || text.includes('scholarship')) return 'bursary';
  if (text.includes('internship')) return 'internship';
  if (text.includes('freelance') || text.includes('remote') || text.includes('contract')) return 'freelance';
  
  return 'job'; // Default
}

/**
 * Helper: Extract salary range from description
 */
function extractSalaryRange(description) {
  if (!description) return null;
  
  // Look for salary patterns like "R10,000 - R15,000" or "R5000 to R8000"
  const patterns = [
    /R\s*([\d,]+)\s*[-–]\s*R\s*([\d,]+)/i,
    /R\s*([\d,]+)\s+to\s+R\s*([\d,]+)/i,
    /R\s*([\d,]+)\s*per\s+month/i
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      const min = parseInt(match[1].replace(/,/g, ''), 10);
      const max = match[2] ? parseInt(match[2].replace(/,/g, ''), 10) : min;
      return { min, max };
    }
  }

  return null;
}

/**
 * Helper: Clean title
 */
function cleanTitle(title) {
  if (!title) return 'Untitled Opportunity';
  return title.trim().substring(0, 200);
}

/**
 * Helper: Clean description
 */
function cleanDescription(description) {
  if (!description) return '';
  
  // Remove HTML tags
  let cleaned = description.replace(/<[^>]*>/g, '');
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Limit length
  return cleaned.substring(0, 2000);
}

module.exports = {
  fetchAllFeeds,
  purgeOldOpportunities,
  FEED_SOURCES
};
