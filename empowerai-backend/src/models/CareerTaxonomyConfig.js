const mongoose = require('mongoose');

const careerTaxonomyConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'careerTaxonomy', unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CareerTaxonomyConfig', careerTaxonomyConfigSchema);
