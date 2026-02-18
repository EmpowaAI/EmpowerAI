// frontend/src/services/aiService.ts
const API_BASE_URL = 'http://localhost:8000';

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
  };
  incomeIdeas?: IncomeIdea[];
}

export interface TransformedCVAnalysis {
  score: number;
  readinessLevel: string;
  summary: string;
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
  };
  recommendations: string[];
  missingKeywords: string[];
  incomeIdeas: IncomeIdea[];
}

class AIService {
  async analyzeCV(cvText: string, jobRequirements: string[] = []): Promise<TransformedCVAnalysis> {
    try {
      console.log('Calling AI Service for CV analysis...', { url: `${API_BASE_URL}/api/cv/analyze` })
      
      const response = await fetch(`${API_BASE_URL}/api/cv/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

      const data: CVAnalysisResponse = await response.json()
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
        url: `${API_BASE_URL}/api/cv/analyze-file`,
        fileName: file.name,
        fileSize: file.size
      })
      
      const response = await fetch(`${API_BASE_URL}/api/cv/analyze-file`, {
        method: 'POST',
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

      const data: CVAnalysisResponse = await response.json()
      console.log('AI Service file analysis response received:', data)
      
      return this.transformResponse(data)
    } catch (error) {
      console.error('CV File Analysis Error:', error)
      throw error
    }
  }

  private transformResponse(data: CVAnalysisResponse): TransformedCVAnalysis {
    // Extract data with proper defaults
    const skills = this.capitalizeSkills(data.extractedSkills || [])
    const missingKeywords = data.marketKeywords || []
    const recommendations = data.suggestions || []
    const incomeIdeas = data.incomeIdeas || this.generateDefaultIncomeIdeas()
    
    // Format about section
    let about = data.about || ''
    
    if (!about || about.length < 30) {
      if (skills.length > 0) {
        about = `Professional with expertise in ${skills.slice(0, 6).join(', ')}.`
      } else {
        about = 'Professional seeking new opportunities.'
      }
    }
    
    about = about.replace(/\s+/g, ' ').trim()
    if (!about.endsWith('.') && !about.endsWith('"') && !about.endsWith('!') && !about.endsWith('?')) {
      about = about + '.'
    }
    
    // Format education - clean up and deduplicate
    const education = this.formatEducation(data.education || [])
    
    // Format experience
    const experience = this.formatExperience(data.experience || [])
    
    // Format achievements
    const achievements = this.formatAchievements(data.achievements || [])
    
    // Get links
    const links = data.links || { linkedin: false, github: false, portfolio: false }
    
    // Calculate score
    const score = this.calculateScore(skills, education, experience, achievements, links)
    
    // Determine readiness level
    const readinessLevel = this.getReadinessLevel(score)
    
    // Generate summary
    const summary = about

    console.log('Transformed data:', {
      about: about.substring(0, 50),
      education,
      experience,
      achievements: achievements.length,
      recommendations: recommendations.length,
      incomeIdeas: incomeIdeas.length
    })

    return {
      score,
      readinessLevel,
      summary,
      sections: {
        about: summary,
        skills,
        education,
        experience,
        achievements
      },
      linkCheck: {
        linkedin: links.linkedin,
        github: links.github,
        portfolio: links.portfolio
      },
      recommendations,
      missingKeywords,
      incomeIdeas
    }
  }

  private capitalizeSkills(skills: string[]): string[] {
    return skills.map(skill => {
      const upperCaseSkills = ['HTML', 'CSS', 'SQL', 'NoSQL', 'AWS', 'Azure', 'CI/CD', 'REST', 'API', 'SDLC', 'OOP', 'AI']
      if (upperCaseSkills.includes(skill.toUpperCase())) {
        return skill.toUpperCase()
      }
      
      if (skill.toLowerCase() === '.net') return '.NET'
      if (skill.toLowerCase() === 'c#') return 'C#'
      if (skill.toLowerCase() === 'c++') return 'C++'
      
      return skill.split(' ').map(word => {
        if (word === word.toUpperCase() && word.length <= 5) {
          return word
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }).join(' ')
    }).sort()
  }

  private formatEducation(education: string[]): string[] {
    const formatted: string[] = []
    const seen = new Set()
    
    for (let entry of education) {
      entry = entry.replace(/\s+/g, ' ').trim()
      
      if (entry.length < 10) continue
      
      // Fix common formatting issues
      entry = entry.replace(/\((\d{4})\)(\d{4})/g, '($1-$2)')
      entry = entry.replace(/(\d{4})-(\d{4})/g, '($1-$2)')
      
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
    
    formatted.sort((a, b) => {
      const yearA = this.extractYear(a)
      const yearB = this.extractYear(b)
      return yearB - yearA
    })
    
    return formatted.slice(0, 3)
  }

  private extractYear(entry: string): number {
    const yearMatch = entry.match(/20\d{2}/)
    return yearMatch ? parseInt(yearMatch[0]) : 0
  }

  private formatExperience(experience: string[]): string[] {
    const formatted: string[] = []
    const seen = new Set()
    
    for (let entry of experience) {
      entry = entry.replace(/\s+/g, ' ').trim()
      
      if (entry.length < 30) continue
      
      if (entry && !entry.endsWith('.') && !entry.endsWith(')')) {
        entry = entry + '.'
      }
      
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
      ach = ach.replace(/\s+/g, ' ').trim()
      
      if (ach.length < 20) continue
      
      if (!ach.endsWith('.') && !ach.endsWith('!') && !ach.endsWith('?')) {
        ach = ach + '.'
      }
      
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
    
    // Skills (max 30)
    score += Math.min(skills.length * 2, 30)
    
    // Education (max 20)
    if (education.length > 0) {
      score += Math.min(education.length * 7, 20)
    }
    
    // Experience (max 25)
    if (experience.length > 0) {
      score += Math.min(experience.length * 8, 25)
    }
    
    // Achievements (max 15)
    if (achievements.length > 0) {
      score += Math.min(achievements.length * 3, 15)
    }
    
    // Links (max 10)
    if (links.linkedin) score += 4
    if (links.github) score += 3
    if (links.portfolio) score += 3
    
    // Bonus for complete profile
    if (education.length >= 2) score += 2
    if (experience.length >= 2) score += 2
    if (achievements.length >= 3) score += 2
    
    return Math.min(Math.round(score), 100)
  }

  private getReadinessLevel(score: number): string {
    if (score >= 85) return 'EXCEPTIONAL'
    if (score >= 75) return 'HIGH POTENTIAL'
    if (score >= 60) return 'INTERMEDIATE'
    if (score >= 45) return 'DEVELOPING'
    return 'JUNIOR'
  }

  private generateDefaultIncomeIdeas(): IncomeIdea[] {
    return [
      {
        title: 'Freelance Opportunities',
        difficulty: 'MEDIUM',
        potential: 'HIGH',
        description: 'Explore freelance platforms to monetize your skills'
      },
      {
        title: 'Skill Development',
        difficulty: 'LOW',
        potential: 'HIGH',
        description: 'Take online courses to build in-demand skills'
      },
      {
        title: 'Remote Employment',
        difficulty: 'MEDIUM',
        potential: 'HIGH',
        description: 'Search for remote roles matching your profile'
      }
    ]
  }
}

const aiService = new AIService()
export default aiService