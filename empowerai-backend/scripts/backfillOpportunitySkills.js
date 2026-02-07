/**
 * Backfill/augment opportunity skills using improved extraction.
 *
 * Usage:
 *   node scripts/backfillOpportunitySkills.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { extractSkillsEnhanced } = require('../src/utils/skillExtractors');

async function main() {
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

  const Opportunity = require('../src/models/Opportunity');
  const cursor = Opportunity.find({ isActive: true }).cursor();

  let processed = 0;
  let updated = 0;
  const bulkOps = [];

  for await (const opp of cursor) {
    processed += 1;
    const baseText = `${opp.title || ''} ${opp.company || ''} ${opp.description || ''}`;
    const extracted = extractSkillsEnhanced(baseText);
    if (extracted.length === 0) continue;

    const existing = Array.isArray(opp.skills) ? opp.skills : [];
    const merged = Array.from(new Set([...existing, ...extracted])).slice(0, 12);

    if (merged.length !== existing.length ||
        merged.some((skill, idx) => skill !== existing[idx])) {
      bulkOps.push({
        updateOne: {
          filter: { _id: opp._id },
          update: { $set: { skills: merged } }
        }
      });
      updated += 1;
    }

    if (bulkOps.length >= 500) {
      await Opportunity.bulkWrite(bulkOps);
      bulkOps.length = 0;
    }
  }

  if (bulkOps.length > 0) {
    await Opportunity.bulkWrite(bulkOps);
  }

  console.log(`Processed: ${processed}`);
  console.log(`Updated skills: ${updated}`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
