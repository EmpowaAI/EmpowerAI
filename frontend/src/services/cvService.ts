// frontend/src/services/cvService.ts
import aiService, { type TransformedCVAnalysis, type RevampedCV, type RevampedCVResponse } from './aiService';

export interface CVAnalysis extends TransformedCVAnalysis {}

export interface RevampedCVWithMeta {
  revampedCV: RevampedCV;
  originalScore: number;
  newScore: number;
  changesSummary: string[];
}

export async function analyzeCV(file: File | null, cvText: string): Promise<CVAnalysis> {
  try {
    if (file) {
      return await aiService.analyzeCVFile(file, []);
    } else if (cvText) {
      return await aiService.analyzeCV(cvText, []);
    }
    throw new Error("No CV data provided");
  } catch (error) {
    console.error("CV Analysis Error:", error);
    throw error;
  }
}

export async function revampCV(cvData: CVAnalysis): Promise<RevampedCVResponse> {
  try {
    console.log("🚀 Sending revamp request with CV data:", {
      score: cvData.score,
      readinessLevel: cvData.readinessLevel,
      sections: cvData.sections ? Object.keys(cvData.sections) : [],
      strengthsCount: cvData.strengths?.length || 0,
      weaknessesCount: cvData.weaknesses?.length || 0
    });
    
    // Call the AI service which returns the structured response directly
    const response = await aiService.revampCV(cvData);
    
    console.log("📥 Revamp response received:", response);
    
    // Handle different response formats
    if (response && typeof response === 'object') {
      // If nested inside data.revamp from Node.js controller
      if ('data' in response && (response as any).data?.revamp) {
        return (response as any).data.revamp as RevampedCVResponse;
      }

      // Check if it's already a RevampedCVResponse with revampedCV property
      if ('revampedCV' in response) {
        console.log("✅ Received full revamp response with nested CV");
        return response as RevampedCVResponse;
      }
      // If it's directly a RevampedCV object, wrap it with metadata
      else if ('professionalSummary' in response || 'name' in response) {
        console.log("✅ Received direct RevampedCV object, wrapping with metadata");
        
        // Calculate new score based on weaknesses
        const weaknesses = cvData.weaknesses || [];
        const improvements = Math.min(weaknesses.length * 4, 25);
        const newScore = Math.min(cvData.score + improvements, 98);
        
        return {
          originalScore: cvData.score,
          newScore: newScore,
          changesSummary: generateChangesSummary(cvData),
          revampedCV: response as RevampedCV
        };
      }
    }
    
    // If response is a string (shouldn't happen with proper API), throw error
    console.error("Unexpected response format:", response);
    throw new Error("Invalid response format from revamp service");
    
  } catch (error) {
    console.error("❌ Failed to revamp CV:", error);
    throw error;
  }
}

// Helper function to generate changes summary from weaknesses
function generateChangesSummary(cvData: CVAnalysis): string[] {
  const weaknesses = cvData.weaknesses || [];
  const missingKeywords = cvData.missingKeywords || [];
  
  const changes: string[] = [];
  
  // Map weaknesses to specific changes
  const weaknessMap: Record<string, string> = {
    "matric": "Added National Senior Certificate (Matric) section with key subjects to meet SA junior screening requirements.",
    "grade 12": "Added National Senior Certificate (Matric) section with key subjects to meet SA junior screening requirements.",
    "work experience": "Introduced a 'Professional Experience' section specifically highlighting core developer duties.",
    "agile": "Incorporated Agile/Scrum methodology keywords throughout experience section.",
    "scrum": "Incorporated Agile/Scrum methodology keywords throughout experience section.",
    "devops": "Added DevOps and containerization tools to skills section.",
    "containerization": "Added DevOps and containerization tools to skills section.",
    "quantifiable": "Restructured 'Projects' with quantified metrics (e.g., percentages, time saved) to demonstrate impact.",
    "metrics": "Restructured 'Projects' with quantified metrics (e.g., percentages, time saved) to demonstrate impact.",
    "driver": "Optimized for South African ATS by adding 'South African Citizen' and 'Driver's Licence: Code B'.",
    "licence": "Optimized for South African ATS by adding 'South African Citizen' and 'Driver's Licence: Code B'.",
    "skills": "Grouped technical skills into logical categories for better keyword parsing.",
    "format": "Transformed the layout to a clean, single-column, professional text structure.",
  };
  
  // Add specific changes based on weaknesses
  for (const weakness of weaknesses.slice(0, 5)) {
    const weaknessLower = weakness.toLowerCase();
    let matched = false;
    
    for (const [key, change] of Object.entries(weaknessMap)) {
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
  
  // Add missing keywords
  if (missingKeywords.length > 0) {
    changes.push(`Added missing keywords: ${missingKeywords.slice(0, 4).join(', ')}`);
  }
  
  // Add SA-specific changes if not already present
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
  
  return changes.slice(0, 7);
}

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || text.trim().length < 50) {
        reject(new Error("Could not extract enough text from the file. Please try a .txt file or paste your CV text."));
        return;
      }
      resolve(text);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}