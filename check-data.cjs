const mongoose = require('mongoose');
require('dotenv').config({ path: './empowerai-backend/.env' });
const Opportunity = require('./empowerai-backend/src/models/Opportunity');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n=== CHECKING REAL OPPORTUNITIES IN DATABASE ===\n');
    
    const opps = await Opportunity.find({ isActive: true }).limit(3).lean();
    
    opps.forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.title}`);
      console.log(`   Company: ${opp.company}`);
      console.log(`   Type: ${opp.type}`);
      console.log(`   Province: ${opp.province.join(', ')}`);
      console.log(`   Apply URL: ${opp.applicationUrl}`);
      console.log('');
    });
    
    const count = await Opportunity.countDocuments({ isActive: true });
    console.log(`Total Active Opportunities: ${count}`);
    
    const byType = await Opportunity.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    console.log('\nBy Type:');
    byType.forEach(t => console.log(`  ${t._id}: ${t.count}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
