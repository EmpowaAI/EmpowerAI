/**
 * Standalone script to fetch RSS feeds
 * Can be run manually or via cron job
 * 
 * Usage:
 *   node scripts/fetchRssFeeds.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { fetchAllFeeds } = require('../src/services/rssFeedService');
const logger = require('../src/utils/logger');

async function main() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is required');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    
    console.log('Connected to MongoDB');
    logger.info('MongoDB connected successfully');

    // Fetch all RSS feeds
    console.log('\nStarting RSS feed aggregation...');
    const result = await fetchAllFeeds();

    // Print results
    console.log('\n=== RSS Feed Aggregation Results ===');
    console.log(`New opportunities: ${result.new}`);
    console.log(`Skipped (duplicates): ${result.skipped}`);
    console.log(`Errors: ${result.errors}`);
    console.log('=====================================\n');

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    logger.error('RSS feed script error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
main();
