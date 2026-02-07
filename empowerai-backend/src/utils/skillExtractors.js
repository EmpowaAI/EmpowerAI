/**
 * Skill extraction helpers
 */

function extractSkillsEnhanced(text) {
  if (!text) return [];
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'Communication', 'Problem Solving', 'Teamwork', 'Leadership',
    'Excel', 'Word', 'PowerPoint', 'Customer Service', 'Sales',
    'Marketing', 'Accounting', 'Finance', 'Project Management',
    'Agile', 'Scrum', 'Git', 'Docker', 'AWS', 'Azure'
  ];
  const techKeywords = [
    'frontend', 'back-end', 'backend', 'full stack', 'full-stack', 'web development',
    'software', 'developer', 'engineering', 'devops', 'cloud', 'api', 'rest', 'graphql',
    'typescript', 'next.js', 'node', 'react', 'vue', 'angular', 'python', 'java', 'c#',
    'database', 'sql', 'mongodb', 'postgres', 'docker', 'kubernetes'
  ];
  const found = [];
  const lower = text.toLowerCase();
  for (const skill of commonSkills) {
    if (lower.includes(skill.toLowerCase())) found.push(skill);
  }
  for (const keyword of techKeywords) {
    if (!lower.includes(keyword)) continue;
    if (keyword === 'full-stack' || keyword === 'full stack') found.push('Full Stack');
    else if (keyword === 'web development') found.push('Web Development');
    else if (keyword === 'backend' || keyword === 'back-end') found.push('Backend');
    else if (keyword === 'frontend') found.push('Frontend');
    else if (keyword === 'devops') found.push('DevOps');
    else if (keyword === 'graphql') found.push('GraphQL');
    else if (keyword === 'typescript') found.push('TypeScript');
    else if (keyword === 'next.js') found.push('Next.js');
    else if (keyword === 'kubernetes') found.push('Kubernetes');
    else if (keyword === 'mongodb') found.push('MongoDB');
    else if (keyword === 'postgres') found.push('PostgreSQL');
    else if (keyword === 'node') found.push('Node.js');
    else if (keyword === 'react') found.push('React');
    else if (keyword === 'vue') found.push('Vue');
    else if (keyword === 'angular') found.push('Angular');
    else if (keyword === 'c#') found.push('C#');
    else if (keyword === 'api' || keyword === 'rest') found.push('APIs');
    else if (keyword === 'database' || keyword === 'sql') found.push('SQL');
    else if (keyword === 'cloud') found.push('Cloud');
    else if (keyword === 'software' || keyword === 'developer' || keyword === 'engineering') found.push('Software Development');
  }
  return Array.from(new Set(found)).slice(0, 12);
}

module.exports = {
  extractSkillsEnhanced
};
