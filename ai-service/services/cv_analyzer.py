"""
CV Analyzer Service
Extracts skills, identifies gaps, and suggests improvements
"""

from typing import List, Dict, Any
import PyPDF2
from docx import Document

class CVAnalyzer:
    """Analyzes CVs and extracts information"""
    
    def __init__(self):
        self.skill_keywords = [
            'python', 'javascript', 'react', 'node', 'sql',
            'communication', 'leadership', 'teamwork', 'problem solving'
        ]
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        # TODO: Implement PDF parsing
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                text += page.extract_text()
        return text
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        # TODO: Implement DOCX parsing
        doc = Document(file_path)
        return '\n'.join([para.text for para in doc.paragraphs])
    
    def extract_skills(self, cv_text: str) -> List[str]:
        """
        Extract skills from CV text
        TODO: Implement with NLP/AI
        """
        found_skills = []
        cv_lower = cv_text.lower()
        for skill in self.skill_keywords:
            if skill.lower() in cv_lower:
                found_skills.append(skill)
        return found_skills
    
    def identify_missing_skills(
        self, 
        extracted_skills: List[str],
        job_requirements: List[str]
    ) -> List[str]:
        """Identify missing skills for a job"""
        # TODO: Implement with AI matching
        missing = []
        for req in job_requirements:
            if req.lower() not in [s.lower() for s in extracted_skills]:
                missing.append(req)
        return missing
    
    def analyze_cv(self, cv_text: str, job_requirements: List[str] = None) -> Dict[str, Any]:
        """
        Complete CV analysis
        TODO: Implement full analysis with AI
        """
        extracted_skills = self.extract_skills(cv_text)
        missing_skills = []
        suggestions = []
        
        if job_requirements:
            missing_skills = self.identify_missing_skills(extracted_skills, job_requirements)
            suggestions = [
                f"Consider adding experience with {skill}" 
                for skill in missing_skills[:3]
            ]
        
        return {
            'extractedSkills': extracted_skills,
            'missingSkills': missing_skills,
            'suggestions': suggestions
        }

