"""
CV Analyzer Service
Extracts skills, identifies gaps, and suggests improvements
"""

from typing import List, Dict, Any, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openai import RateLimitError
from utils.ai_client import AIClient

class CVAnalyzer:
    """Analyzes CVs and extracts information"""
    
    def __init__(self, ai_client: Optional[AIClient] = None):
        self.ai_client = ai_client or AIClient()
        self.skill_keywords = [
            'python', 'javascript', 'react', 'node', 'sql', 'html', 'css',
            'communication', 'leadership', 'teamwork', 'problem solving',
            'excel', 'word', 'powerpoint', 'customer service', 'sales'
        ]
    
    def extract_skills(self, cv_text: str) -> List[str]:
        """
        Extract skills from CV text using AI with keyword fallback
        """
        if not cv_text or not cv_text.strip():
            return []
        
        # Always do keyword matching first (fast, no API call)
        found_skills = []
        cv_lower = cv_text.lower()
        for skill in self.skill_keywords:
            if skill.lower() in cv_lower and skill not in found_skills:
                found_skills.append(skill)
        
        # Use AI to extract additional skills (only if AI client is enabled)
        ai_skills = []
        if self.ai_client and self.ai_client.enabled:
            try:
                ai_skills = self.ai_client.extract_skills(cv_text)
            except RateLimitError:
                # Re-raise rate limit errors so they can be handled at the route level
                # Don't fall back silently - let the route return 429 properly
                raise
            except Exception as e:
                print(f"AI extraction error: {e}, using keyword fallback")
                # On non-rate-limit errors, continue with keyword fallback
                ai_skills = []
        
        # Combine and deduplicate (keyword matching always works as fallback)
        all_skills = list(set(ai_skills + found_skills))
        return all_skills[:20]  # Limit to top 20 skills
    
    def identify_missing_skills(
        self, 
        extracted_skills: List[str],
        job_requirements: List[str]
    ) -> List[str]:
        """Identify missing skills for a job using AI matching"""
        if not job_requirements:
            return []
        
        missing = []
        extracted_lower = [s.lower() for s in extracted_skills]
        
        for req in job_requirements:
            req_lower = req.lower()
            # Check for exact match or partial match
            found = False
            for skill in extracted_lower:
                if req_lower in skill or skill in req_lower:
                    found = True
                    break
            if not found:
                missing.append(req)
        
        return missing
    
    def generate_suggestions(
        self,
        extracted_skills: List[str],
        missing_skills: List[str],
        cv_text: str
    ) -> List[str]:
        """Generate AI-powered improvement suggestions"""
        suggestions = []
        
        if missing_skills:
            for skill in missing_skills[:3]:
                suggestions.append(
                    f"Add experience or training in {skill} to improve job fit"
                )
        
        # TEMPORARILY DISABLED: AI suggestions to reduce OpenAI API calls
        # Each CV analysis was making 2+ OpenAI calls (skills + suggestions)
        # This reduces it to just 1 call (skills only)
        # Use AI to generate contextual suggestions ONLY if we have skills and no rate limit issues
        # if self.ai_client and cv_text and extracted_skills:
        #     try:
        #         prompt = f"""Based on this CV, provide 2-3 specific, actionable suggestions to improve it for job applications in South Africa.
        #
        # CV Summary: {cv_text[:500]}
        #
        # Current Skills: {', '.join(extracted_skills[:10])}
        #
        # Provide only the suggestions, one per line, without numbering."""
        #         
        #         ai_suggestions = self.ai_client.generate_text(
        #             prompt,
        #             system_prompt="You are a career advisor helping youth in South Africa improve their CVs.",
        #             temperature=0.7,
        #             max_tokens=200
        #         )
        #         
        #         # Parse suggestions
        #         for line in ai_suggestions.split('\n'):
        #             line = line.strip()
        #             if line and len(line) > 20:
        #                 suggestions.append(line)
        #     except RateLimitError:
        #         # Re-raise rate limit errors so they can be handled at the route level
        #         raise
        #     except Exception as e:
        #         print(f"AI suggestion error: {e}")
        
        # Fallback suggestions (always provide these)
        if len(extracted_skills) < 5:
            suggestions.append("Add more specific skills to your CV")
        if not missing_skills and len(suggestions) < 3:
            suggestions.append("Highlight your achievements and quantifiable results")
        if len(suggestions) < 2:
            suggestions.append("Tailor your CV to match the job requirements")
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    def analyze_cv(self, cv_text: str, job_requirements: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Complete CV analysis with AI enhancement
        """
        if not cv_text or not cv_text.strip():
            return {
                'extractedSkills': [],
                'missingSkills': [],
                'suggestions': ['Please provide CV text for analysis']
            }
        
        extracted_skills = self.extract_skills(cv_text)
        missing_skills = []
        
        if job_requirements:
            missing_skills = self.identify_missing_skills(extracted_skills, job_requirements)
        
        suggestions = self.generate_suggestions(extracted_skills, missing_skills, cv_text)
        
        return {
            'extractedSkills': extracted_skills,
            'missingSkills': missing_skills,
            'suggestions': suggestions
        }

