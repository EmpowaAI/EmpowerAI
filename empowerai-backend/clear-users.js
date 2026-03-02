/**
 * Clear All Users Script
 * 
 * This script will delete ALL users from the database:
 * - User collection (verified users)
 * - PendingUser collection (unverified users)
 * 
 * WARNING: This is a DESTRUCTIVE operation!
 * Use only in development or when you need to start fresh.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const clearDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Connection string:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('');

    const db = mongoose.connection.db;
    
    // Clear User collection
    console.log('🗑️  Clearing User collection...');
    const userCount = await db.collection('users').countDocuments();
    console.log(`   Found ${userCount} users`);
    if (userCount > 0) {
      await db.collection('users').deleteMany({});
      console.log(`   ✅ Deleted ${userCount} users`);
    } else {
      console.log('   ℹ️  User collection is already empty');
    }

    // Clear PendingUser collection
    console.log('🗑️  Clearing PendingUser collection...');
    const pendingCount = await db.collection('pendingusers').countDocuments();
    console.log(`   Found ${pendingCount} pending users`);
    if (pendingCount > 0) {
      await db.collection('pendingusers').deleteMany({});
      console.log(`   ✅ Deleted ${pendingCount} pending users`);
    } else {
      console.log('   ℹ️  PendingUser collection is already empty');
    }

    console.log('');
    console.log('🎉 Database cleared successfully!');
    console.log('📧 All email/user data has been removed.');
    console.log('🆕 You can now start fresh with new registrations.');
    console.log('');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

console.log('⚠️  WARNING: This will delete ALL users from the database!');
console.log('');

clearDatabase();
