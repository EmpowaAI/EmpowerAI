/**
 * Fetch Real Opportunities from Job APIs
 * 
 * This script fetches real, live job opportunities from:
 * - Adzuna API (South African jobs)
 * - Indeed API (global + South Africa)
 * - RSS Feeds (job board aggregators)
 * 
 * Usage:
 *   node scripts/fetchRealOpportunities.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

async function main() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is required');
      console.error('Add MONGODB_URI to your .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB\n');

    // Check API credentials
    console.log('📋 Checking API Credentials:');
    
    const adzunaConfigured = process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY;
    const indeedConfigured = process.env.INDEED_PUBLISHER_ID;
    
    console.log(`  ${adzunaConfigured ? '✅' : '❌'} Adzuna API ${adzunaConfigured ? 'CONFIGURED' : 'NOT configured'}`);
    console.log(`  ${indeedConfigured ? '✅' : '❌'} Indeed API ${indeedConfigured ? 'CONFIGURED' : 'NOT configured'}`);
    console.log('');

    if (!adzunaConfigured && !indeedConfigured) {
      console.error('❌ ERROR: No job APIs are configured!');
      console.error('\n📝 To use real opportunities:');
      console.error('   1. Sign up for Adzuna API: https://developer.adzuna.com');
      console.error('   2. Get your App ID and Key');
      console.error('   3. Add to .env file:');
      console.error('      ADZUNA_APP_ID=your_id');
      console.error('      ADZUNA_APP_KEY=your_key');
      console.error('\n   Then run this script again.');
      process.exit(1);
    }

    // Fetch from Adzuna
    if (adzunaConfigured) {
      console.log('🚀 Fetching opportunities from Adzuna API...');
      try {
        const { fetchAdzunaJobs } = require('../src/services/jobAPIService');
        const jobs = await fetchAdzunaJobs();
        console.log(`   📊 Found ${jobs.length} opportunities from Adzuna`);
        
        // Save to database
        if (jobs.length > 0) {
          const Opportunity = require('../src/models/Opportunity');
          
          let newCount = 0;
          let skippedCount = 0;

          for (const job of jobs) {
            try {
              // Check if already exists
              const existing = await Opportunity.findOne({
                externalId: job.externalId,
                source: job.source
              });

              if (!existing) {
                await Opportunity.create(job);
                newCount++;
              } else {
                skippedCount++;
              }
            } catch (error) {
              console.error(`   Error saving job: ${error.message}`);
            }
          }

          console.log(`   ✅ Added ${newCount} new opportunities`);
          console.log(`   ⏭️  Skipped ${skippedCount} duplicates`);
        }
      } catch (error) {
        console.error(`❌ Error fetching from Adzuna: ${error.message}`);
      }
    }

    // Fetch from Indeed
    if (indeedConfigured) {
      console.log('\n🚀 Fetching opportunities from Indeed API...');
      try {
        const { fetchIndeedJobs } = require('../src/services/jobAPIService');
        const jobs = await fetchIndeedJobs();
        console.log(`   📊 Found ${jobs.length} opportunities from Indeed`);
        
        // Save to database (similar to Adzuna)
        if (jobs.length > 0) {
          const Opportunity = require('../src/models/Opportunity');
          
          let newCount = 0;
          let skippedCount = 0;

          for (const job of jobs) {
            try {
              const existing = await Opportunity.findOne({
                externalId: job.externalId,
                source: job.source
              });

              if (!existing) {
                await Opportunity.create(job);
                newCount++;
              } else {
                skippedCount++;
              }
            } catch (error) {
              console.error(`   Error saving job: ${error.message}`);
            }
          }

          console.log(`   ✅ Added ${newCount} new opportunities`);
          console.log(`   ⏭️  Skipped ${skippedCount} duplicates`);
        }
      } catch (error) {
        console.error(`❌ Error fetching from Indeed: ${error.message}`);
      }
    }

    // Fetch from RSS Feeds
    console.log('\n🚀 Fetching opportunities from RSS Feeds...');
    try {
      const { fetchAllFeeds } = require('../src/services/rssFeedService');
      const result = await fetchAllFeeds();
      console.log(`   ✅ Added ${result.new} new opportunities`);
      console.log(`   ⏭️  Skipped ${result.skipped} duplicates`);
    } catch (error) {
      console.warn(`⚠️  Note: RSS feed fetch failed (this is okay if not configured): ${error.message}`);
    }

    // Get final stats
    console.log('\n📊 Database Statistics:');
    try {
      const Opportunity = require('../src/models/Opportunity');
      const total = await Opportunity.countDocuments({});
      const active = await Opportunity.countDocuments({ isActive: true });
      
      const bySource = await Opportunity.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]);

      console.log(`   Total opportunities: ${total}`);
      console.log(`   Active opportunities: ${active}`);
      console.log('\n   By Source:');
      bySource.forEach(item => {
        console.log(`     - ${item._id || 'unknown'}: ${item.count}`);
      });
    } catch (error) {
      console.error(`Error getting stats: ${error.message}`);
    }

    console.log('\n✅ Real opportunities fetch complete!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Visit http://localhost:5000/api/opportunities to see real jobs');
    console.log('   2. Frontend will now display real opportunities');
    console.log('   3. Set ENABLE_JOB_API_SCHEDULER=true to fetch daily at 2 AM');

    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    logger.error('Real opportunities fetch error:', error);
    process.exit(1);
  }
}

// Run
main();
