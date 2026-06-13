const defaultTaxonomy = require('../config/careerTaxonomy');

// In-memory override — survives for the process lifetime; resets on deploy.
// Admin can update via PUT /api/admin/taxonomy but changes are not persisted.
let _override = null;

async function getCareerTaxonomy() {
  return _override || defaultTaxonomy;
}

async function setCareerTaxonomy(data) {
  _override = data;
  return data;
}

module.exports = {
  getCareerTaxonomy,
  setCareerTaxonomy
};
