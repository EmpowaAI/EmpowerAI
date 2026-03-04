export const calculateEmpowermentScore = (data: any): number => {
  let score = 50;

  if (data.skills?.length > 0) score += data.skills.length * 5;
  if (data.experienceYears && data.experienceYears > 0) score += Math.min(data.experienceYears * 3, 20);
  if (data.education?.length > 0) score += 10;
  if (data.certifications?.length > 0) score += data.certifications.length * 3;
  if (data.projects?.length > 0) score += data.projects.length * 4;

  return Math.min(Math.max(score, 0), 100);
};

