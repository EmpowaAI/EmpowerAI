const CareerTaxonomyConfig = require('../models/CareerTaxonomyConfig');
const defaultTaxonomy = require('../config/careerTaxonomy');

async function getCareerTaxonomy() {
  try {
    const doc = await CareerTaxonomyConfig.findOne({ key: 'careerTaxonomy' }).lean();
    if (doc && doc.data) return doc.data;
  } catch (error) {
    // Fall back to default if DB unavailable
  }
  return defaultTaxonomy;
}

async function setCareerTaxonomy(data) {
  const updated = await CareerTaxonomyConfig.findOneAndUpdate(
    { key: 'careerTaxonomy' },
    { data },
    { upsert: true, new: true }
  );
  return updated?.data || data;
}

module.exports = {
  getCareerTaxonomy,
  setCareerTaxonomy
};
