/**
 * Opportunity Matching Service
 * 
 * Matches user profiles to job opportunities
 * Uses:
 * - CV skills analysis
 * - Location preferences
 * - Experience level
 * - Salary expectations
 * - Job type preferences
 */

const logger = require('../../utils/logger');
const educationBoosts = require('../../config/educationBoosts');

/**
 * Helper to escape strings for use in Regex
 */
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Words that carry no career signal — dropped from tokenised matching so a
// goal like "senior software engineer" isn't matched on "senior" alone.
const CAREER_STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'in', 'for', 'to', 'with', 'at', 'on',
  'senior', 'junior', 'mid', 'lead', 'entry', 'level', 'i', 'ii', 'iii',
  'jnr', 'snr', 'intern', 'graduate', 'trainee', 'assistant',
]);

/**
 * Split a career term / goal into meaningful lowercase tokens.
 * Keeps tech tokens like c++, .net, c#, node.js.
 */
function tokenizeTerm(term) {
  return String(term || '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map(t => t.replace(/^\.+|\.+$/g, ''))
    .filter(t => t.length >= 2 && !CAREER_STOPWORDS.has(t));
}

/** True if `token` appears as a whole word in `haystack`. */
function wordInHaystack(token, haystack) {
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(token)}(?:$|[^a-z0-9])`, 'i').test(haystack);
}

/**
 * Relevance of a set of career terms/goals to a text haystack, 0..1.
 * Full-phrase hit scores 1; otherwise the best fraction of a term's tokens
 * that appear as whole words in the haystack. Works for any career —
 * technical or not — without needing a taxonomy entry.
 */
function careerRelevance(terms, haystack) {
  if (!Array.isArray(terms) || terms.length === 0 || !haystack) return 0;
  let best = 0;
  for (const term of terms) {
    const phrase = String(term || '').toLowerCase().trim();
    if (!phrase) continue;
    if (phrase.length >= 3 && haystack.includes(phrase)) return 1;
    const tokens = tokenizeTerm(phrase);
    if (tokens.length === 0) continue;
    const hits = tokens.filter(tok => wordInHaystack(tok, haystack)).length;
    best = Math.max(best, hits / tokens.length);
  }
  return best;
}

/**
 * Calculate match score for an opportunity
 * Returns score from 0-100
 */
function calculateMatchScore(userProfile, opportunity) {
  if (!userProfile || !opportunity) return 0;

  let score = 0;
  let weights = {
    skills: 0,
    location: 0,
    experience: 0,
    salary: 0,
    type: 0,
    career: 0,
    boost: 0,
    educationBoost: 0
  };

  // 1. Skills matching (40% weight)
  let skillsMatched = 0;
  if (userProfile.skills && opportunity.skills) {
    const userSkillsLower = userProfile.skills.map(s => s.toLowerCase());
    const oppSkillsLower = opportunity.skills.map(s => s.toLowerCase());

    const matchingSkills = oppSkillsLower.filter(skill =>
      userSkillsLower.some(userSkill => 
        userSkill === skill ||
        // Technical Boundary Logic: Matches start/end of string or non-alphanumeric chars
        // This ensures .NET and C++ match correctly where \b would fail
        new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegExp(skill)}(?:$|[^a-zA-Z0-9])`, 'i').test(userSkill) ||
        new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegExp(userSkill)}(?:$|[^a-zA-Z0-9])`, 'i').test(skill)
      )
    );
    
    skillsMatched = matchingSkills.length;
    weights.skills = Math.min((matchingSkills.length / Math.max(oppSkillsLower.length, 3)) * 40, 40);
  }

  // 2. Location matching (25% weight)
  if (userProfile.province && opportunity.province) {
    const userProvinces = Array.isArray(userProfile.province) 
      ? userProfile.province 
      : [userProfile.province];
    
    const oppProvinces = Array.isArray(opportunity.province)
      ? opportunity.province
      : [opportunity.province];

    const locationMatch = oppProvinces.some(oppProv =>
      userProvinces.some(userProv =>
        userProv.toLowerCase().includes(oppProv.toLowerCase()) ||
        oppProv.toLowerCase().includes(userProv.toLowerCase())
      )
    );

    weights.location = locationMatch ? 25 : 5; // Reduce weight if location doesn't match
  }

  // 3. Experience level matching (20% weight)
  if (userProfile.yearsOfExperience && opportunity.description) {
    const description = opportunity.description.toLowerCase();
    const userExp = userProfile.yearsOfExperience;

    let expMatch = 0;
    if (userExp === 0 && (description.includes('entry level') || description.includes('graduate'))) {
      expMatch = 100;
    } else if (userExp === 0 && (description.includes('internship') || description.includes('learnership'))) {
      expMatch = 100;
    } else if (userExp > 0 && userExp <= 2 && description.includes('junior')) {
      expMatch = 90;
    } else if (userExp > 2 && userExp <= 5 && description.includes('mid')) {
      expMatch = 90;
    } else if (userExp > 5 && (description.includes('senior') || description.includes('lead'))) {
      expMatch = 90;
    } else {
      expMatch = 50; // Partial match
    }

    weights.experience = (expMatch / 100) * 20;
  }

  // 4. Salary matching (10% weight)
  if (userProfile.salaryExpectation && opportunity.salaryRange) {
    const userMin = userProfile.salaryExpectation.min || 0;
    const userMax = userProfile.salaryExpectation.max || 999999;
    const oppMin = opportunity.salaryRange.min || 0;
    const oppMax = opportunity.salaryRange.max || 999999;

    // Check if ranges overlap
    const rangesOverlap = !(oppMax < userMin || oppMin > userMax);
    
    weights.salary = rangesOverlap ? 10 : 3; // Reduce if salary doesn't match
  }

  // 5. Job type preference (5% weight)
  if (userProfile.preferredJobTypes && opportunity.type) {
    const typeMatches = userProfile.preferredJobTypes.some(pref =>
      pref.toLowerCase() === opportunity.type.toLowerCase()
    );

    weights.type = typeMatches ? 5 : 1;
  }
  const hasSkillMatch = skillsMatched > 0;

  // Title carries the strongest career signal, so weight it heavily.
  const oppHaystack = [
    opportunity.title,
    opportunity.company,
    opportunity.description,
    Array.isArray(opportunity.skills) ? opportunity.skills.join(' ') : ''
  ].join(' ').toLowerCase();
  const oppTitle = String(opportunity.title || '').toLowerCase();

  // 6. Career goal alignment (bonus up to 25%) — tokenised & proportional so
  // "AI Engineer" matches "Machine Learning Engineer", and every career
  // (technical or not) gets partial credit instead of all-or-nothing.
  let hasCareerMatch = false;
  if (userProfile.careerGoals && userProfile.careerGoals.length > 0) {
    const titleRel = careerRelevance(userProfile.careerGoals, oppTitle);
    const bodyRel = careerRelevance(userProfile.careerGoals, oppHaystack);
    const rel = Math.max(titleRel, bodyRel * 0.7); // a title hit is worth more
    hasCareerMatch = rel >= 0.5;
    // Weighted up to 45 so a strong role/title match (e.g. an "AI Engineer"
    // listing for an AI-engineer user) clears the score threshold on its own,
    // even when the job's listed skills don't overlap the user's.
    weights.career = Math.round(rel * 45);
  }

  // 7. Boost signals (up to 15%)
  let hasBoostMatch = false;
  if (Array.isArray(userProfile.boostSkills) && userProfile.boostSkills.length > 0) {
    const rel = careerRelevance(userProfile.boostSkills, oppHaystack);
    hasBoostMatch = rel > 0;
    weights.boost = Math.round(rel * 15);
  }

  // 8. Education-based boost (up to 10%)
  if (userProfile.education && educationBoosts?.levels?.length) {
    const edu = userProfile.education.toLowerCase();
    const boostTerms = educationBoosts.levels
      .filter(level => level.match?.some(m => edu.includes(m)))
      .flatMap(level => level.boostSkills || [])
      .map(s => s.toLowerCase());

    if (boostTerms.length > 0) {
      const haystack = [
        opportunity.title,
        opportunity.company,
        opportunity.description,
        Array.isArray(opportunity.skills) ? opportunity.skills.join(' ') : ''
      ].join(' ').toLowerCase();

      const educationBoostMatch = boostTerms.some(term => haystack.includes(term));
      weights.educationBoost = educationBoostMatch ? (educationBoosts.weight || 10) : 0;
    }
  }

  score = weights.skills + weights.location + weights.experience + weights.salary + weights.type + weights.career + weights.boost + weights.educationBoost;
  // If the user provided skills/goals and none match, drop to 0 - but only if profile is mature
  const hasSignals = (userProfile.skills && userProfile.skills.length > 0) ||
    (userProfile.careerGoals && userProfile.careerGoals.length > 0);
  if (hasSignals && !hasSkillMatch && !hasCareerMatch && score < 20) {
    score = 0;
  }

  // If strict career match is enabled, enforce a career match when goals are provided
  if (userProfile.strictCareerMatch && userProfile.careerGoals && userProfile.careerGoals.length > 0 && !hasCareerMatch) {
    score = 0;
  }
  
  // If we have a very low score but some skills match, give a baseline boost
  if (score < 30 && hasSkillMatch) score += 15;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

/**
 * Get match reason for UI display
 */
function getMatchReason(userProfile, opportunity, score) {
  const reasons = [];

  if (!userProfile || !opportunity) return 'No match data available';

  // Skills
  if (userProfile.skills && opportunity.skills) {
    const matchingSkills = opportunity.skills.filter(skill => 
      userProfile.skills.some(userSkill => 
        userSkill.toLowerCase() === skill.toLowerCase() ||
        new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegExp(skill)}(?:$|[^a-zA-Z0-9])`, 'i').test(userSkill) ||
        new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegExp(userSkill)}(?:$|[^a-zA-Z0-9])`, 'i').test(skill)
      )
    );
    if (matchingSkills.length > 0) {
      reasons.push(`${matchingSkills.length} of your skills match`);
    }
  }

  // Location
  if (userProfile.province && opportunity.province) {
    const match = (Array.isArray(opportunity.province) ? opportunity.province : [opportunity.province])
      .some(oppProv => 
        userProfile.province?.toLowerCase().includes(oppProv.toLowerCase())
      );
    if (match) {
      reasons.push('matches your province');
    }
  }

  // Experience level
  if (userProfile.yearsOfExperience === 0 && opportunity.type === 'internship') {
    reasons.push('perfect for your level');
  } else if (userProfile.yearsOfExperience > 0) {
    reasons.push('matches your experience level');
  }

  // Career goals
  if (userProfile.careerGoals && userProfile.careerGoals.length > 0) {
    const haystack = [
      opportunity.title,
      opportunity.company,
      opportunity.description,
      Array.isArray(opportunity.skills) ? opportunity.skills.join(' ') : ''
    ].join(' ').toLowerCase();
    const matchedGoal = userProfile.careerGoals.find(goal =>
      haystack.includes(goal.toLowerCase())
    );
    if (matchedGoal) {
      reasons.push(`aligns with ${matchedGoal}`);
    }
  }

  return reasons.length > 0 ? reasons.join(', ') : `${score}% match`;
}

/**
 * Extract user profile from request
 */
function extractUserProfile(req) {
  const user = req.user || {};
  let profile = {
    userId: user.id,
    skills: [],
    province: null,
    yearsOfExperience: 0,
    salaryExpectation: null,
    preferredJobTypes: ['job', 'internship', 'learnership'],
    education: user.education || null,
    careerGoals: user.interests || [],
    ...user.profile
  };

  // Try to get skills from query parameters
  if (req.query.skills) {
    profile.skills = req.query.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s);
  }
  
  // If no skills in query, try to get from the analyzed CV data if available
  if (profile.skills.length === 0 && user.cvData?.extractedSkills) {
    profile.skills = user.cvData.extractedSkills;
  }

  // Try to get province from query parameters
  if (req.query.province) {
    profile.province = req.query.province;
  }

  // Try to get career goals from query parameters
  const careerQuery = req.query.career || req.query.careerGoal || req.query.careerGoals || req.query.interests;
  if (typeof careerQuery === 'string') {
    profile.careerGoals = careerQuery
      .split(',')
      .map(s => s.trim())
      .filter(s => s);
  }

  // Try to get minimum score from query parameters
  if (req.query.minScore) {
    const parsed = parseInt(req.query.minScore, 10);
    if (!Number.isNaN(parsed)) {
      profile.minMatchScore = parsed;
    }
  }

  if (req.query.strictCareer === 'true') {
    profile.strictCareerMatch = true;
  }

  return profile;
}

/**
 * Filter and rank opportunities based on user profile
 */
async function getMatchedOpportunities(opportunities, userProfile) {
  if (!Array.isArray(opportunities)) {
    opportunities = [];
  }

  // Calculate match scores
  const scoredOpportunities = opportunities.map(opp => {
    const matchScore = calculateMatchScore(userProfile, opp);
    return {
      ...opp,
      matchScore,
      matchReason: getMatchReason(userProfile, opp, matchScore)
    };
  });

  // Filter out very low matches
  const minScore = userProfile.minMatchScore ?? 45;
  const filtered = scoredOpportunities.filter(opp => opp.matchScore >= minScore);

  // Sort by match score descending
  filtered.sort((a, b) => {
    if ((b.matchScore || 0) !== (a.matchScore || 0)) return (b.matchScore || 0) - (a.matchScore || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return filtered;
}

module.exports = {
  calculateMatchScore,
  getMatchReason,
  extractUserProfile,
  getMatchedOpportunities,
  careerRelevance,
  tokenizeTerm
};
