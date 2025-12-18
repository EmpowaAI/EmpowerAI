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
    await EconomicTwin.collection.createIndex({ userId: 1 }, { unique: true, background: true });
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

