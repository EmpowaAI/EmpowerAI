const { post, postForm, FormData } = require('../../intergration/ai/ai.ServiceClient');

async function analyseCVText({ cv_text, target_role, industry, job_description }) {
  return post('api/cv/text', { cv_text, target_role, industry, job_description });
}

async function analyseCVFile({ fileBuffer, filename, mimetype, target_role, industry, job_description }) {
  const form = new FormData();
  form.append('file', fileBuffer, { filename, contentType: mimetype });
  form.append('target_role', target_role);
  form.append('industry', industry);
  if (job_description) form.append('job_description', job_description);

  return postForm('api/cv/upload', form);
}

async function revampCV({ cv_text, analysis, target_role, industry }) {
  return post('api/cv/revamp/', { cv_text, analysis, target_role, industry });
}

module.exports = { analyseCVText, analyseCVFile, revampCV };
