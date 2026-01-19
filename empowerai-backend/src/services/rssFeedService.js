/**
 * RSS Feed Service
 * 
 * Fetches and parses RSS feeds from South African job boards
 * and transforms them into Opportunity format for our database.
 */

const Parser = require('rss-parser');
const Opportunity = require('../models/Opportunity');
const logger = require('../utils/logger');

const parser = new Parser({
  timeout: 15000,
  maxRedirects: 5,
  customFields: {
    item: [
      ['salary', 'salary'],
      ['company', 'company'],
      ['location', 'location'],
      ['jobType', 'jobType'],
    ]
  }
});

// RSS Feed Sources - Real South African Job Boards
// Using verified working RSS feed URLs
const FEED_SOURCES = [
  {
    name: 'MyJobMag - Entry Level',
    url: 'https://www.myjobmag.co.za/feeds/rss.xml?category=entry-level',
    type: 'job',
    transform: transformMyJobMagFeed
  },
  {
    name: 'MyJobMag - Learnerships',
    url: 'https://www.myjobmag.co.za/feeds/rss.xml?category=learnerships',
    type: 'learnership',
    transform: transformMyJobMagFeed
  },
  {
    name: 'MyJobMag - Internships',
    url: 'https://www.myjobmag.co.za/feeds/rss.xml?category=internships',
    type: 'internship',
    transform: transformMyJobMagFeed
  },
  {
    name: 'MyJobMag - All Jobs',
    url: 'https://www.myjobmag.co.za/feeds/rss.xml',
    type: 'job',
    transform: transformMyJobMagFeed
  },
  {
    name: 'CareerJet SA',
    url: 'https://www.careerjet.co.za/rss/jobs.xml?l=south+africa&q=entry+level',
    type: 'job',
    transform: transformCareerJetFeed
  },
  // Adding general job board RSS feeds
  {
    name: 'AllJobs.co.za',
    url: 'https://www.alljobs.co.za/jobs/rss.xml',
    type: 'job',
    transform: transformAllJobsFeed
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

  for (const source of FEED_SOURCES) {
    try {
      logger.info(`Fetching feed: ${source.name} (${source.url})`);
      const feed = await parser.parseURL(source.url);
      
      if (!feed || !feed.items || feed.items.length === 0) {
        logger.warn(`No items found in feed: ${source.name}`);
        continue;
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

  logger.info(`RSS aggregation complete: ${totalNew} new, ${totalSkipped} skipped, ${totalErrors} errors`);
  return { new: totalNew, skipped: totalSkipped, errors: totalErrors };
}

/**
 * Find existing opportunity by title, company, and link
 */
async function findExistingOpportunity(opportunity) {
  // Try multiple strategies for deduplication
  const queries = [
    { applicationUrl: opportunity.applicationUrl },
    { 
      title: new RegExp(opportunity.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
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
    const skills = extractSkills(description);

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
    const skills = extractSkills(description);
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
    const skills = extractSkills(description);
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
    const skills = extractSkills(description);

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
    const skills = extractSkills(description);
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
    const skills = extractSkills(description);
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

  return foundSkills.slice(0, 10); // Limit to 10 skills
}

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
  FEED_SOURCES
};
