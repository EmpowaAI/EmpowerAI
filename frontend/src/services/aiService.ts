// frontend/src/services/aiService.ts
import { API_BASE_URL } from '../lib/apiBase';

const getToken = () => localStorage.getItem('empowerai-token');

export interface IncomeIdea {
  title: string;
  difficulty: string;
  potential: string;
  description: string;
}

export interface CVAnalysisResponse {
  extractedSkills: string[];
  missingSkills: string[];
  marketKeywords: string[];
  suggestions: string[];
  about: string;
  education: string[];
  experience: string[];
  achievements: string[];
  cvText: string;
  links?: {
    linkedin: boolean;
    github: boolean;
    portfolio: boolean;
    driversLicence?: boolean;
  };
  incomeIdeas?: IncomeIdea[];
  // NEW FIELDS from enhanced API
  score?: number;
  readinessLevel?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  missingKeywords?: string[];
  industry?: string;
  summary?: string;
}

export interface TransformedCVAnalysis {
  score: number;
  readinessLevel: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  sections: {
    about: string;
    skills: string[];
    education: string[];
    experience: string[];
    achievements: string[];
  };
  linkCheck: {
    linkedin: boolean;
    github: boolean;
    portfolio: boolean;
    driversLicence?: boolean;
  };
  recommendations: string[];
  missingKeywords: string[];
  incomeIdeas: IncomeIdea[];
  // Add these fields that might be in the data
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  citizenship?: string;
  driversLicence?: string;
  industry?: string;
}

export interface RevampedCV {
  name: string;
  contactInfo?: string;
  links?: string;
  credentials?: string;
  professionalSummary?: string;
  technicalSkills?: Record<string, string>;
  experience?: Array<{
    title: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  projects?: Array<{
    name: string;
    technologies?: string;
    bullets: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    dates?: string;
    details?: string;
  }>;
  languages?: string[];
}

export interface RevampedCVResponse {
  originalScore: number;
  newScore: number;
  changesSummary: string[];
  revampedCV: RevampedCV;
}

// Helper function to format education entries properly
export function formatEducationForDisplay(education: Array<{ degree: string; institution: string; dates?: string; details?: string }>): Array<{ line: string; isInstitution?: boolean }> {
  const formattedEntries: Array<{ line: string; isInstitution?: boolean }> = [];
  
  for (const edu of education) {
    let degreeText = edu.degree || "";
    let institutionText = edu.institution || "";
    let datesText = edu.dates || "";
    
    // Extract date from degree if present and not already separated
    const dateMatch = degreeText.match(/(20\d{2})\s*[–-]\s*(20\d{2}|present|current)/i);
    if (dateMatch && !datesText) {
      datesText = dateMatch[0];
      // Remove date from degree text
      degreeText = degreeText.replace(/\s*\(?20\d{2}\s*[–-]\s*(20\d{2}|present|current)\)?/, '').trim();
    }
    
    // Clean up degree text
    degreeText = degreeText.replace(/\s+/g, ' ').trim();
    
    // Format dates with proper en dash
    if (datesText) {
      datesText = datesText.replace(/-/g, '–');
    }
    
    // Add degree with dates on same line
    if (degreeText) {
      if (datesText) {
        formattedEntries.push({ line: `${degreeText} (${datesText})`, isInstitution: false });
      } else {
        formattedEntries.push({ line: degreeText, isInstitution: false });
      }
    }
    
    // Add institution on next line if exists
    if (institutionText && !degreeText.includes(institutionText)) {
      formattedEntries.push({ line: institutionText, isInstitution: true });
    }
    
    // Add details if present
    if (edu.details) {
      formattedEntries.push({ line: edu.details, isInstitution: false });
    }
  }
  
  return formattedEntries;
}

class AIService {
  async analyzeCV(cvText: string, jobRequirements: string[] = []): Promise<TransformedCVAnalysis> {
    try {
      console.log('Calling AI Service for CV analysis...', { url: `${API_BASE_URL}/cv/analyze` })
      
      const response = await fetch(`${API_BASE_URL}/cv/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({
          cvText,
          jobRequirements,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
        console.error('AI Service error response:', { status: response.status, error })
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || '60'
          throw {
            status: 429,
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: parseInt(retryAfter)
          }
        }
        if (response.status === 503) {
          throw {
            status: 503,
            message: 'AI service is temporarily unavailable. Please try again later.'
          }
        }
        throw new Error(error.detail || `Failed to analyze CV (Status: ${response.status})`)
      }

      const raw = await response.json()
      const data: CVAnalysisResponse = raw?.data?.analysis || raw
      console.log('AI Service response received:', data)
      return this.transformResponse(data)
    } catch (error) {
      console.error('CV Analysis Error:', error)
      throw error
    }
  }

  async analyzeCVFile(file: File, jobRequirements: string[] = []): Promise<TransformedCVAnalysis> {
    const formData = new FormData()
    formData.append('cvFile', file)
    if (jobRequirements.length > 0) {
      formData.append('jobRequirements', JSON.stringify(jobRequirements))
    }

    try {
      console.log('Calling AI Service for CV file analysis...', { 
        url: `${API_BASE_URL}/cv/analyze-file`,
        fileName: file.name,
        fileSize: file.size
      })
      
      const response = await fetch(`${API_BASE_URL}/cv/analyze-file`, {
        method: 'POST',
        headers: {
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
        console.error('AI Service error response:', { status: response.status, error })
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || '60'
          throw {
            status: 429,
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: parseInt(retryAfter)
          }
        }
        if (response.status === 503) {
          throw {
            status: 503,
            message: 'AI service is temporarily unavailable. Please try again later.'
          }
        }
        throw new Error(error.detail || `Failed to analyze CV file (Status: ${response.status})`)
      }

      const raw = await response.json()
      const data: CVAnalysisResponse = (raw as any)?.data?.analysis || raw
      console.log('✅ AI Service file analysis response received:', data)
      console.log('📊 Weaknesses from API:', data.weaknesses)
      
      return this.transformResponse(data)
    } catch (error) {
      console.error('CV File Analysis Error:', error)
      throw error
    }
  }

  async revampCV(cvData: TransformedCVAnalysis): Promise<RevampedCVResponse> {
    try {
      console.log('Calling Azure AI for CV revamp...', { url: `${API_BASE_URL}/cv/revamp` });
      
      const response = await fetch(`${API_BASE_URL}/cv/revamp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({
          cvData,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || '60';
          const error = await response.json().catch(() => ({ detail: 'Rate limit exceeded' }));
          throw {
            status: 429,
            message: error.detail || error.message || 'Rate limit exceeded. Please try again shortly.',
            retryAfter: parseInt(retryAfter),
          };
        }

        if (response.status === 503) {
          const error = await response.json().catch(() => ({ detail: 'Service unavailable' }));
          throw {
            status: 503,
            message: error.detail || error.message || 'CV revamp is temporarily unavailable. Please try again later.',
          };
        }

        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || error.message || `Failed to revamp CV (Status: ${response.status})`);
      }

      const raw = await response.json();
      const data = (raw as any)?.data?.revamp || raw;
      console.log('Azure AI revamp response received:', data);
      
      if (data && typeof data === 'object') {
        if ('revampedCV' in data) {
          console.log("✅ Response is in RevampedCVResponse format");
          return data as RevampedCVResponse;
        }
        else if ('name' in data || 'professionalSummary' in data) {
          console.log("✅ Response is direct RevampedCV object, wrapping with metadata");
          
          const weaknesses = cvData.weaknesses || [];
          const improvements = Math.min(weaknesses.length * 4, 25);
          const newScore = Math.min(cvData.score + improvements, 98);
          const changesSummary = this.generateChangesSummary(cvData);
          
          return {
            originalScore: cvData.score,
            newScore: newScore,
            changesSummary: changesSummary,
            revampedCV: data as RevampedCV
          };
        }
        else {
          console.log("⚠️ Response format is unexpected, attempting to map fields");
          const revampedCV = this.extractRevampedCVFromResponse(data, cvData);
          const weaknesses = cvData.weaknesses || [];
          const improvements = Math.min(weaknesses.length * 4, 25);
          const newScore = Math.min(cvData.score + improvements, 98);
          const changesSummary = this.generateChangesSummary(cvData);
          
          return {
            originalScore: cvData.score,
            newScore: newScore,
            changesSummary: changesSummary,
            revampedCV: revampedCV
          };
        }
      }
      
      console.error("Unexpected response format:", data);
      throw new Error("Invalid response format from revamp service");
      
    } catch (error) {
      console.error('CV Revamp Error:', error);
      throw error;
    }
  }

  private extractRevampedCVFromResponse(data: any, cvData: TransformedCVAnalysis): RevampedCV {
    const revampedCV: RevampedCV = {
      name: cvData.name || "Your Name",
      contactInfo: "",
      links: "",
      credentials: "",
      professionalSummary: cvData.sections?.about || "",
      technicalSkills: {},
      experience: [],
      projects: [],
      education: [],
      languages: ["English: Fluent"]
    };
    
    if (data.name) revampedCV.name = data.name;
    else if (data.fullName) revampedCV.name = data.fullName;
    else if (data.candidateName) revampedCV.name = data.candidateName;
    
    if (data.contactInfo) revampedCV.contactInfo = data.contactInfo;
    else if (data.contact) revampedCV.contactInfo = data.contact;
    
    if (data.links) revampedCV.links = data.links;
    else if (data.socialLinks) revampedCV.links = data.socialLinks;
    
    if (data.credentials) revampedCV.credentials = data.credentials;
    
    if (data.professionalSummary) revampedCV.professionalSummary = data.professionalSummary;
    else if (data.summary) revampedCV.professionalSummary = data.summary;
    else if (data.profile) revampedCV.professionalSummary = data.profile;
    
    if (data.technicalSkills) revampedCV.technicalSkills = data.technicalSkills;
    else if (data.skills) {
      if (typeof data.skills === 'object') {
        revampedCV.technicalSkills = data.skills;
      } else if (Array.isArray(data.skills)) {
        const skills = data.skills;
        const languages = skills.filter((s: string) => 
          ['python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'sql'].includes(s.toLowerCase())
        );
        const frameworks = skills.filter((s: string) => 
          ['.net', 'react', 'angular', 'vue', 'bootstrap', 'tailwind'].includes(s.toLowerCase())
        );
        const tools = skills.filter((s: string) => 
          ['azure', 'aws', 'git', 'docker', 'devops', 'mongodb'].includes(s.toLowerCase())
        );
        
        if (languages.length > 0) revampedCV.technicalSkills!['Languages'] = languages.join(', ');
        if (frameworks.length > 0) revampedCV.technicalSkills!['Frameworks'] = frameworks.join(', ');
        if (tools.length > 0) revampedCV.technicalSkills!['Tools & Platforms'] = tools.join(', ');
      }
    }
    
    if (data.experience && Array.isArray(data.experience)) {
      revampedCV.experience = data.experience;
    } else if (data.workExperience && Array.isArray(data.workExperience)) {
      revampedCV.experience = data.workExperience;
    }
    
    if (data.projects && Array.isArray(data.projects)) {
      revampedCV.projects = data.projects;
    } else if (data.portfolio && Array.isArray(data.portfolio)) {
      revampedCV.projects = data.portfolio;
    }
    
    if (data.education && Array.isArray(data.education)) {
      revampedCV.education = data.education;
    } else if (data.qualifications && Array.isArray(data.qualifications)) {
      revampedCV.education = data.qualifications;
    }
    
    if (data.languages && Array.isArray(data.languages)) {
      revampedCV.languages = data.languages;
    }
    
    return revampedCV;
  }

  private generateChangesSummary(cvData: TransformedCVAnalysis): string[] {
    const weaknesses = cvData.weaknesses || [];
    const missingKeywords = cvData.missingKeywords || [];
    const industry = cvData.industry || '';
    
    const changes: string[] = [];
    
    // Industry-specific change mapping
    const retailChanges = {
      "pos": "Added specific POS/till systems used to demonstrate technical proficiency",
      "till": "Added specific POS/till systems used to demonstrate technical proficiency",
      "driver": "Added driver's licence status - critical for retail roles requiring transport",
      "licence": "Added driver's licence status - critical for retail roles requiring transport",
      "matric": "Expanded education section with Matric subjects and NQF level",
      "merchandising": "Added merchandising and inventory control keywords for ATS optimization",
      "stock": "Enhanced stock management experience with specific metrics",
      "customer": "Added customer satisfaction metrics and service achievements"
    };
    
    const techChanges = {
      "agile": "Incorporated Agile/Scrum methodology keywords throughout experience section",
      "scrum": "Incorporated Agile/Scrum methodology keywords throughout experience section",
      "devops": "Added DevOps and containerization tools to skills section",
      "docker": "Added Docker and containerization experience",
      "github": "Added GitHub profile link and project repositories"
    };
    
    const changesMap = industry === 'retail' ? retailChanges : techChanges;
    
    for (const weakness of weaknesses.slice(0, 5)) {
      const weaknessLower = weakness.toLowerCase();
      let matched = false;
      
      for (const [key, change] of Object.entries(changesMap)) {
        if (weaknessLower.includes(key)) {
          if (!changes.includes(change)) {
            changes.push(change);
            matched = true;
            break;
          }
        }
      }
      
      if (!matched) {
        changes.push(`Addressed: ${weakness.substring(0, 50)}...`);
      }
    }
    
    if (missingKeywords.length > 0) {
      changes.push(`Added missing keywords: ${missingKeywords.slice(0, 4).join(', ')}`);
    }
    
    if (industry === 'retail') {
      const retailSpecific = [
        "Added measurable achievements with numbers (e.g., daily customers served, cash handled)",
        "Enhanced formatting with clear headings and bullet points for ATS readability",
        "Added shift flexibility and weekend availability statements"
      ];
      
      for (const change of retailSpecific) {
        if (!changes.includes(change) && changes.length < 7) {
          changes.push(change);
        }
      }
    } else {
      const saChanges = [
        "Added National Senior Certificate (Matric) section with key subjects to meet SA junior screening requirements.",
        "Optimized for South African ATS by adding 'South African Citizen' and 'Driver's Licence: Code B'.",
        "Included a 'Languages' section reflecting South Africa's multilingual business environment.",
      ];
      
      for (const change of saChanges) {
        if (!changes.includes(change) && changes.length < 7) {
          changes.push(change);
        }
      }
    }
    
    return changes.slice(0, 7);
  }

  private transformResponse(data: CVAnalysisResponse): TransformedCVAnalysis {
    const skills = this.capitalizeSkills(data.extractedSkills || [])
    const missingKeywords = data.marketKeywords || data.missingKeywords || []
    const recommendations = data.suggestions || data.recommendations || []
    const incomeIdeas = data.incomeIdeas || this.generateDefaultIncomeIdeas()
    
    // ✅ CRITICAL FIX: Use weaknesses from API if available
    let weaknesses: string[] = []
    
    if (data.weaknesses && data.weaknesses.length > 0) {
      console.log('✅ Using weaknesses from API:', data.weaknesses)
      weaknesses = data.weaknesses
    } else {
      console.log('⚠️ No weaknesses from API, generating fallback')
      weaknesses = this.generateWeaknessesFallback(
        skills, 
        data.education || [], 
        data.experience || [], 
        data.achievements || [], 
        data.links || { linkedin: false, github: false, portfolio: false },
        missingKeywords
      )
    }
    
    let about = data.about || data.summary || ''
    if (!about || about.length < 30) {
      about = skills.length > 0 
        ? `Professional with expertise in ${skills.slice(0, 6).join(', ')}.`
        : 'Professional seeking new opportunities.'
    }
    
    about = about.replace(/\s+/g, ' ').trim()
    if (!about.endsWith('.')) about = about + '.'
    
    const education = this.formatEducation(data.education || [])
    const experience = this.formatExperience(data.experience || [])
    const achievements = this.formatAchievements(data.achievements || [])
    const links = data.links || { linkedin: false, github: false, portfolio: false }
    
    let score = data.score
    if (!score) {
      score = this.calculateScore(skills, education, experience, achievements, links)
    }
    
    let readinessLevel = data.readinessLevel
    if (!readinessLevel) {
      readinessLevel = this.getReadinessLevel(score)
    }
    
    let strengths = data.strengths
    if (!strengths || strengths.length === 0) {
      strengths = this.generateStrengthsFallback(skills, education, experience, achievements, links)
    }
    
    let name = "Your Name";
    const nameMatch = about?.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) name = nameMatch[1];
    
    let email = "";
    const emailMatch = data.cvText?.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) email = emailMatch[0];
    
    let phone = "";
    const phoneMatch = data.cvText?.match(/(?:\+27|0)[\s-]?[1-9][0-9]{8}/);
    if (phoneMatch) phone = phoneMatch[0];

    console.log('📊 Final transformed data:', {
      score,
      readinessLevel,
      strengthsCount: strengths.length,
      weaknessesCount: weaknesses.length,
      weaknesses: weaknesses.slice(0, 3)
    })

    return {
      score,
      readinessLevel,
      summary: about,
      strengths,
      weaknesses,
      sections: {
        about,
        skills,
        education,
        experience,
        achievements
      },
      linkCheck: {
        linkedin: links.linkedin,
        github: links.github,
        portfolio: links.portfolio,
        driversLicence: links.driversLicence
      },
      recommendations,
      missingKeywords,
      incomeIdeas,
      name,
      email,
      phone,
      industry: data.industry
    }
  }

  private generateStrengthsFallback(
    skills: string[],
    education: string[],
    experience: string[],
    achievements: string[],
    links: { linkedin: boolean; github: boolean; portfolio: boolean }
  ): string[] {
    const strengths: string[] = []

    if (education.length > 0) {
      strengths.push(`Strong academic background with ${education[0]}`)
      if (education.length >= 2) {
        strengths.push('Multiple educational qualifications showing commitment to learning')
      }
    }

    if (skills.length >= 10) {
      strengths.push(`Extensive technical skill set covering ${skills.slice(0, 5).join(', ')} and more`)
    } else if (skills.length >= 5) {
      strengths.push(`Solid technical foundation in ${skills.slice(0, 5).join(', ')}`)
    }

    if (skills.some(s => ['C#', 'Java', '.NET'].includes(s))) {
      strengths.push('Strong object-oriented programming foundation')
    }

    if (achievements.length >= 3) {
      strengths.push(`Track record of ${achievements.length} significant achievements/projects`)
    }

    return [...new Set(strengths)].slice(0, 5)
  }

  private generateWeaknessesFallback(
    skills: string[],
    education: string[],
    experience: string[],
    achievements: string[],
    links: { linkedin: boolean; github: boolean; portfolio: boolean },
    missingKeywords: string[]
  ): string[] {
    const weaknesses: string[] = []

    if (!education.some(edu => edu.includes('Matric') || edu.includes('Grade 12'))) {
      weaknesses.push('Matric/Grade 12 details missing - important for SA graduate programs')
    }

    if (experience.length === 0) {
      weaknesses.push('No work experience listed - add internships, projects, or freelance work')
    }

    if (achievements.length < 2) {
      weaknesses.push('Few quantifiable achievements - add metrics and numbers to demonstrate impact')
    }

    if (missingKeywords.includes('Drivers Licence')) {
      weaknesses.push('Driver\'s licence not mentioned - critical for many SA junior roles')
    }

    if (skills.length < 5) {
      weaknesses.push('Limited skills listed - add more relevant skills to strengthen your profile')
    }

    return [...new Set(weaknesses)].slice(0, 5)
  }

  private capitalizeSkills(skills: string[]): string[] {
    return skills.map(skill => {
      const upperCaseSkills = ['HTML', 'CSS', 'SQL', 'AWS', 'Azure', 'CI/CD', 'REST', 'API']
      if (upperCaseSkills.includes(skill.toUpperCase())) {
        return skill.toUpperCase()
      }
      
      if (skill.toLowerCase() === '.net') return '.NET'
      if (skill.toLowerCase() === 'c#') return 'C#'
      if (skill.toLowerCase() === 'c++') return 'C++'
      
      return skill.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }).sort()
  }

  private formatEducation(education: string[]): string[] {
    const formatted: string[] = []
    const seen = new Set()
    
    for (let entry of education) {
      entry = entry.replace(/\s+/g, ' ').trim()
      if (entry.length < 10) continue
      
      const yearMatch = entry.match(/\d{4}-\d{4}|\d{4}-Present|\d{4}/)
      if (yearMatch && !entry.includes('(')) {
        entry = entry.replace(yearMatch[0], `(${yearMatch[0]})`)
      }
      
      const key = entry.toLowerCase().replace(/[\(\)\d]/g, '').trim()
      if (!seen.has(key) && entry.length > 15) {
        seen.add(key)
        formatted.push(entry)
      }
    }
    
    return formatted.slice(0, 3)
  }

  private formatExperience(experience: string[]): string[] {
    const formatted: string[] = []
    const seen = new Set()
    
    for (let entry of experience) {
      entry = entry.replace(/\s+/g, ' ').trim()
      if (entry.length < 30) continue
      if (!entry.endsWith('.')) entry = entry + '.'
      
      const key = entry.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        formatted.push(entry)
      }
    }
    
    return formatted.slice(0, 3)
  }

  private formatAchievements(achievements: string[]): string[] {
    const formatted: string[] = []
    const seen = new Set()
    
    for (let ach of achievements) {
      ach = ach.replace(/^[•\-*]\s*/, '').trim()
      if (ach.length < 20) continue
      if (!ach.endsWith('.')) ach = ach + '.'
      ach = ach.charAt(0).toUpperCase() + ach.slice(1)
      
      const key = ach.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        formatted.push(ach)
      }
    }
    
    return formatted.slice(0, 6)
  }

  private calculateScore(
    skills: string[], 
    education: string[], 
    experience: string[],
    achievements: string[],
    links: { linkedin: boolean; github: boolean; portfolio: boolean }
  ): number {
    let score = 0
    
    score += Math.min(skills.length * 2, 30)
    if (education.length > 0) score += Math.min(education.length * 7, 20)
    if (experience.length > 0) score += Math.min(experience.length * 8, 25)
    if (achievements.length > 0) score += Math.min(achievements.length * 3, 15)
    
    if (links.linkedin) score += 4
    if (links.github) score += 3
    if (links.portfolio) score += 3
    
    if (education.length >= 2) score += 2
    if (experience.length >= 2) score += 2
    if (achievements.length >= 3) score += 2
    
    return Math.min(Math.round(score), 100)
  }

  private getReadinessLevel(score: number): string {
    if (score >= 85) return 'EXCEPTIONAL'
    if (score >= 75) return 'HIGH POTENTIAL'
    if (score >= 60) return 'GOOD'
    if (score >= 45) return 'DEVELOPING'
    return 'JUNIOR'
  }

  private generateDefaultIncomeIdeas(): IncomeIdea[] {
    return [
      {
        title: 'Freelance Development',
        difficulty: 'MEDIUM',
        potential: 'HIGH',
        description: 'Offer your development services on platforms like Upwork, Toptal, or Fiverr'
      },
      {
        title: 'Technical Support',
        difficulty: 'LOW',
        potential: 'MEDIUM',
        description: 'Provide technical support or tutoring services to individuals or small businesses'
      },
      {
        title: 'Remote Tech Role',
        difficulty: 'MEDIUM',
        potential: 'HIGH',
        description: 'Target international companies hiring remote tech talent'
      }
    ]
  }
}

const aiService = new AIService()
export default aiService
