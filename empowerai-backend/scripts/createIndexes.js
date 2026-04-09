/**
 * Database Index Creation Script
 * Principal Engineer Level: Optimize database queries with proper indexes
 * 
 * Run this script once to create indexes:
 * node src/scripts/createIndexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const EconomicTwin = require('../models/EconomicTwin');

async function createIndexes() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log('✅ Connected to MongoDB');

    // Create User indexes
    console.log('Creating User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true, background: true });
    await User.collection.createIndex({ createdAt: -1 }, { background: true });
    await User.collection.createIndex({ province: 1 }, { background: true });
    console.log('✅ User indexes created');

    // Create EconomicTwin indexes
    console.log('Creating EconomicTwin indexes...');
    
    // Check for duplicate userIds before creating unique index
    const duplicates = await EconomicTwin.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate userId entries. Cleaning up...`);
      
      // Keep the most recent twin for each user, delete older ones
      for (const dup of duplicates) {
        const twins = await EconomicTwin.find({ userId: dup._id })
          .sort({ createdAt: -1 })
          .lean();
        
        // Keep the first (most recent), delete the rest
        if (twins.length > 1) {
          const idsToDelete = twins.slice(1).map(t => t._id);
          await EconomicTwin.deleteMany({ _id: { $in: idsToDelete } });
          console.log(`  Removed ${idsToDelete.length} duplicate twin(s) for user ${dup._id}`);
        }
      }
      
      console.log('✅ Duplicates cleaned up');
    }
    
    // Try to create unique index, if it fails due to duplicates, create non-unique
    try {
      await EconomicTwin.collection.createIndex({ userId: 1 }, { unique: true, background: true });
      console.log('✅ Created unique index on userId');
    } catch (error) {
      if (error.code === 11000 || error.codeName === 'DuplicateKey') {
        console.log('⚠️  Cannot create unique index due to duplicates. Creating non-unique index instead.');
        await EconomicTwin.collection.createIndex({ userId: 1 }, { background: true });
        console.log('✅ Created non-unique index on userId');
      } else {
        throw error;
      }
    }
    
    await EconomicTwin.collection.createIndex({ createdAt: -1 }, { background: true });
    await EconomicTwin.collection.createIndex({ 'simulationHistory.timestamp': -1 }, { background: true });
    console.log('✅ EconomicTwin indexes created');

    console.log('✅ All indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();

