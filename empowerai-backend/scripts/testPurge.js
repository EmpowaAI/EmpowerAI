/**
 * Test script for manual purge functionality
 * 
 * Usage: node scripts/testPurge.js [days]
 * Example: node scripts/testPurge.js 30
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Opportunity = require('../src/models/Opportunity');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/empowerai';

async function testPurge(daysOld = 30) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    console.log(`\nLooking for opportunities older than ${daysOld} days (before ${cutoffDate.toISOString()})...`);

    // Count opportunities before purge
    const beforeCount = await Opportunity.countDocuments({ createdAt: { $lt: cutoffDate } });
    console.log(`Found ${beforeCount} opportunities to purge`);

    if (beforeCount === 0) {
      console.log('No opportunities to purge. Exiting.');
      await mongoose.disconnect();
      return;
    }

    // Show sample of opportunities that will be deleted
    const sample = await Opportunity.find({ createdAt: { $lt: cutoffDate } })
      .limit(5)
      .select('title company createdAt')
      .sort({ createdAt: 1 });
    
    console.log('\nSample opportunities that will be purged:');
    sample.forEach(opp => {
      console.log(`  - ${opp.title} at ${opp.company} (created: ${opp.createdAt.toISOString()})`);
    });

    // Perform purge
    console.log(`\nPurging ${beforeCount} opportunities...`);
    const result = await Opportunity.deleteMany({ createdAt: { $lt: cutoffDate } });
    
    console.log(`\n✅ Purge completed!`);
    console.log(`   Removed: ${result.deletedCount} opportunities`);
    
    // Count remaining opportunities
    const afterCount = await Opportunity.countDocuments();
    console.log(`   Remaining opportunities: ${afterCount}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error during purge test:', error);
    process.exit(1);
  }
}

const daysOld = parseInt(process.argv[2]) || 30;
testPurge(daysOld);
