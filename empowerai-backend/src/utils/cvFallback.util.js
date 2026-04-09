/**
 * cvFallback.util.js
 * Builds a basic (fallback) CV analysis when the AI service is unavailable.
 * Pure business logic — no HTTP, no DB, no Express.
 */

const { extractSkillsEnhanced } = require('./skillExtractors');

const buildFallbackAnalysis = (cvText, jobRequirementsArray) => {
  const text = (cvText || '').toString();
  const extractedSkills = extractSkillsEnhanced(text);

  const missingSkills = Array.isArray(jobRequirementsArray)
    ? jobRequirementsArray.filter(
        (req) => !extractedSkills.some((skill) => skill.toLowerCase().includes(req.toLowerCase()))
      )
    : [];

  const suggestions = [];
  const trimmed = text.trim();
  const hasReadableText = trimmed.length >= 50;

  if (extractedSkills.length === 0) {
    suggestions.push(
      hasReadableText
        ? 'Add more detail about your skills and tools to improve matching.'
        : 'We could not extract readable text from this file (it may be scanned/image-based). Try uploading a DOCX/text PDF or run OCR, or paste your CV text.'
    );
  }

  if (missingSkills.length > 0) {
    suggestions.push(
      'Consider adding evidence for these requirements: ' + missingSkills.slice(0, 5).join(', ')
    );
  }

  suggestions.push('Include measurable outcomes (numbers, projects, and results) to strengthen your CV.');

  let score = 0;
  if (hasReadableText) {
    score += Math.min(extractedSkills.length * 2, 30);
    score += trimmed.length >= 1200 ? 20 : trimmed.length >= 600 ? 12 : 6;
    if (missingSkills.length > 0) score = Math.max(10, score - Math.min(missingSkills.length * 2, 10));
    score = Math.min(score, 100);
  }

  const readinessLevel =
    score >= 85 ? 'EXCEPTIONAL' :
    score >= 75 ? 'HIGH POTENTIAL' :
    score >= 60 ? 'GOOD' :
    score >= 45 ? 'DEVELOPING' :
    'JUNIOR';

  const strengths =
    extractedSkills.length > 0
      ? [`Identified key skills: ${extractedSkills.slice(0, 6).join(', ')}`]
      : hasReadableText
      ? ['CV text extracted successfully']
      : [];

  const weaknesses = !hasReadableText
    ? ['File appears to have no selectable text (scanned/image-based). Use OCR or upload DOCX/text PDF.']
    : extractedSkills.length === 0
    ? ['No clear skills detected from the extracted text — add a dedicated skills section.']
    : [];

  return {
    extractedSkills,
    missingSkills,
    suggestions,
    marketKeywords: [],
    about:
      extractedSkills.length > 0
        ? `Professional with experience in ${extractedSkills.slice(0, 6).join(', ')}.`
        : 'Motivated professional seeking new opportunities.',
    education: [],
    experience: [],
    achievements: [],
    cvText: trimmed.slice(0, 2000),
    links: { linkedin: false, github: false, portfolio: false, driversLicence: false },
    score,
    readinessLevel,
    strengths,
    weaknesses,
    recommendations: suggestions,
    missingKeywords: missingSkills,
    industry: 'general',
    summary:
      extractedSkills.length > 0
        ? `Candidate with ${extractedSkills.length} detected skills.`
        : hasReadableText
        ? 'Candidate profile extracted from CV text.'
        : 'Unable to extract readable text from uploaded file.',
    analysisSource: 'fallback',
  };
};

module.exports = { buildFallbackAnalysis };
