/**
 * Career taxonomy mapping
 * - terms: keywords to match in opportunities
 * - boostSkills: high-signal skills to boost relevance
 * - strict: if true, can require career match when strictCareerMatch enabled
 */

module.exports = {
  'Tech Career': {
    strict: true,
    terms: [
      'software', 'developer', 'engineer', 'engineering', 'data', 'it', 'cyber', 'cloud', 'devops',
      'ai', 'ml', 'web', 'mobile', 'frontend', 'backend', 'full stack', 'full-stack', 'qa', 'tester'
    ],
    boostSkills: [
      'Web Development', 'Frontend', 'Backend', 'Full Stack', 'React', 'Node.js', 'TypeScript',
      'JavaScript', 'Python', 'Java', 'SQL', 'APIs', 'Cloud', 'DevOps'
    ]
  },
  'Freelancing': {
    terms: ['freelance', 'contract', 'gig', 'remote', 'self-employed', 'consultant'],
    boostSkills: ['Communication', 'Time Management', 'Customer Service']
  },
  'Corporate Job': {
    terms: ['corporate', 'office', 'graduate program', 'management', 'analyst', 'coordinator'],
    boostSkills: ['Excel', 'PowerPoint', 'Communication', 'Project Management']
  },
  'Entrepreneurship': {
    terms: ['entrepreneur', 'startup', 'founder', 'business owner', 'small business'],
    boostSkills: ['Leadership', 'Sales', 'Marketing', 'Finance']
  },
  'Creative Industry': {
    terms: ['design', 'graphic', 'ui', 'ux', 'content', 'writer', 'video', 'photography', 'marketing'],
    boostSkills: ['Creativity', 'Writing', 'Content Creation', 'Design']
  },
  'Finance': {
    terms: ['finance', 'accounting', 'banking', 'audit', 'tax', 'investment', 'financial'],
    boostSkills: ['Excel', 'Accounting', 'Finance', 'SQL']
  },
  'Healthcare': {
    terms: ['health', 'medical', 'nurse', 'clinic', 'pharmacy', 'care'],
    boostSkills: ['Care', 'Communication']
  },
  'Education': {
    terms: ['teacher', 'education', 'tutor', 'training', 'facilitator', 'lecturer'],
    boostSkills: ['Communication', 'Leadership']
  },
  'Engineering': {
    terms: ['engineering', 'mechanical', 'electrical', 'civil', 'maintenance', 'technician'],
    boostSkills: ['Problem Solving', 'Project Management']
  },
  'Trades': {
    terms: ['artisan', 'welder', 'plumber', 'electrician', 'carpenter', 'fitter', 'turner'],
    boostSkills: ['Problem Solving']
  },
  'Hospitality': {
    terms: ['hospitality', 'hotel', 'restaurant', 'chef', 'waiter', 'front desk'],
    boostSkills: ['Customer Service', 'Communication']
  },
  'Agriculture': {
    terms: ['agriculture', 'farm', 'agribusiness', 'horticulture', 'livestock'],
    boostSkills: ['Teamwork']
  },
  'Logistics': {
    terms: ['logistics', 'warehouse', 'supply chain', 'driver', 'fleet', 'dispatch'],
    boostSkills: ['Communication', 'Problem Solving']
  },
  'Customer Service': {
    terms: ['customer service', 'call center', 'support', 'client service', 'helpdesk'],
    boostSkills: ['Customer Service', 'Communication']
  },
  'Sales & Marketing': {
    terms: ['sales', 'marketing', 'brand', 'digital marketing', 'business development'],
    boostSkills: ['Sales', 'Marketing', 'Communication']
  }
};
