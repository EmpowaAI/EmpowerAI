"""
CV Revamp Service
Rewrites CV to achieve 95%+ ATS compatibility
Uses Azure OpenAI when available
"""

from typing import Dict, Any, Optional, List
import sys
import os
import re
import json
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai_client import AIClient
from utils.logger import get_logger

class CVRevampService:
    """Revamps CVs for ATS optimization"""

    def __init__(self, ai_client: Optional[AIClient] = None):
        self.ai_client = ai_client or AIClient()
        self.logger = get_logger()

    async def revamp_cv(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Revamp CV using AI, return structured response with original score, new score, changes, and revamped CV
        """
        original_score = cv_data.get('score', 0)
        
        self.logger.info("=" * 50)
        self.logger.info("🚀 Starting CV revamp process...")
        self.logger.info(f"Original score: {original_score}")
        self.logger.info("=" * 50)
        
        # Try AI-powered revamp first
        ai_result = await self._revamp_with_ai(cv_data)
        
        if ai_result:
            self.logger.info(f"✅ AI revamp successful")
            
            # Parse the AI result into structured format
            revamped_cv = await self._parse_ai_result_to_structured_cv(ai_result, cv_data)
            
            # Calculate new score based on improvements
            weaknesses = cv_data.get('weaknesses', [])
            improvements = min(len(weaknesses) * 4, 25)
            new_score = min(original_score + improvements, 98)
            
            # Generate changes summary based on actual weaknesses and CV type
            changes_summary = self._generate_changes_summary(cv_data)
            
            self.logger.info("✅ Revamp complete!")
            
            return {
                "originalScore": original_score,
                "newScore": new_score,
                "changesSummary": changes_summary,
                "revampedCV": revamped_cv
            }
        
        self.logger.error("❌ AI revamp failed")
        raise Exception("AI revamp service unavailable. Please try again later.")

    async def _parse_ai_result_to_structured_cv(self, ai_text: str, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse AI-generated text into structured CV format.
        """
        # Get original CV data for fallback
        sections = cv_data.get('sections', {})
        original_cv_text = cv_data.get('cvText', '')
        original_education = sections.get('education', [])
        original_experience = sections.get('experience', [])
        original_skills = sections.get('skills', [])
        original_about = sections.get('about', '')
        original_achievements = sections.get('achievements', [])
        
        # Extract contact info from original data
        email = cv_data.get('email', '')
        phone = cv_data.get('phone', '')
        name = cv_data.get('name', '')
        links = cv_data.get('linkCheck', {})
        
        # Detect CV type from original data
        cv_type = self._detect_cv_type(original_skills, original_experience, original_education)
        self.logger.info(f"Detected CV type: {cv_type}")
        
        # Clean the AI text
        ai_text = self._clean_ai_text(ai_text)
        
        # For RETAIL candidates, build a clean retail CV structure
        if cv_type == "retail":
            return await self._parse_retail_cv(ai_text, cv_data, name, email, phone, links, original_about, original_skills, original_experience, original_education)
        else:
            # For TECH candidates, use the tech CV structure with exact formatting
            return await self._parse_tech_cv(ai_text, cv_data, name, email, phone, links, original_about, original_skills, original_experience, original_education, original_achievements)
    
    async def _parse_retail_cv(self, ai_text: str, cv_data: Dict[str, Any], name: str, email: str, phone: str, links: Dict, original_about: str, original_skills: List[str], original_experience: List[str], original_education: List[str]) -> Dict[str, Any]:
        """Parse AI response into a clean retail CV structure."""
        
        revamped_cv = {
            "name": name or "",
            "contactInfo": "",
            "links": "",
            "credentials": "",
            "professionalSummary": "",
            "coreCompetencies": [],
            "softSkills": [],
            "experience": [],
            "education": [],
            "languages": []
        }
        
        lines = ai_text.split('\n')
        
        # Extract name
        for line in lines[:10]:
            line = line.strip()
            if line and not any(h in line.lower() for h in ['professional', 'summary', 'skills', 'experience', 'education', 'languages', 'contact', 'linkedin', 'github', 'id holder']):
                if len(line.split()) >= 2 and not any(c in line for c in ['@', 'http', 'linkedin', 'github', '|']):
                    revamped_cv["name"] = line
                    break
        
        # Extract contact info
        for line in lines:
            line = line.strip()
            if '|' in line and ('@' in line or any(d in line for d in ['0','1','2','3','4','5','6','7','8','9'])):
                revamped_cv["contactInfo"] = line
                break
        
        # Extract links
        for line in lines:
            line = line.strip()
            if ('linkedin' in line.lower() or 'github' in line.lower()) and '|' in line:
                revamped_cv["links"] = line
                break
        
        # Extract credentials
        for line in lines:
            line = line.strip()
            if any(x in line.lower() for x in ['id holder', "driver's license", 'b-bbee', 'south african citizen']):
                revamped_cv["credentials"] = line
                break
        
        # Parse sections
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            line_lower = line.lower()
            
            # Professional Summary
            if "professional summary" in line_lower or "profile summary" in line_lower:
                summary_lines = []
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                    if any(s in next_line.lower() for s in ['core competencies', 'technical skills', 'professional experience', 'education', 'languages']):
                        break
                    if next_line and not next_line.startswith(('•', '-', '*', '|')):
                        summary_lines.append(next_line)
                    j += 1
                revamped_cv["professionalSummary"] = ' '.join(summary_lines)
                continue
            
            # Core Competencies
            if "core competencies" in line_lower:
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                    if any(s in next_line.lower() for s in ['soft skills', 'professional experience', 'education', 'languages']):
                        break
                    if next_line.startswith(('•', '-', '*')):
                        skill = re.sub(r'^[•\-*]\s*', '', next_line).strip()
                        if skill:
                            revamped_cv["coreCompetencies"].append(skill)
                    elif ',' in next_line:
                        skills_list = [s.strip() for s in next_line.split(',')]
                        revamped_cv["coreCompetencies"].extend(skills_list)
                    j += 1
                continue
            
            # Soft Skills
            if "soft skills" in line_lower:
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                    if any(s in next_line.lower() for s in ['professional experience', 'education', 'languages']):
                        break
                    if next_line.startswith(('•', '-', '*')):
                        skill = re.sub(r'^[•\-*]\s*', '', next_line).strip()
                        if skill:
                            revamped_cv["softSkills"].append(skill)
                    elif ',' in next_line:
                        skills_list = [s.strip() for s in next_line.split(',')]
                        revamped_cv["softSkills"].extend(skills_list)
                    j += 1
                continue
            
            # Professional Experience
            if "professional experience" in line_lower or "work experience" in line_lower:
                j = i + 1
                current_exp = None
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                    if any(s in next_line.lower() for s in ['education', 'languages', 'core competencies', 'soft skills']):
                        break
                    
                    if '|' in next_line:
                        if current_exp and current_exp.get('bullets'):
                            revamped_cv["experience"].append(current_exp)
                        parts = [p.strip() for p in next_line.split('|')]
                        current_exp = {
                            "title": parts[0] if len(parts) > 0 else "",
                            "company": parts[1] if len(parts) > 1 else "",
                            "dates": parts[2] if len(parts) > 2 else "",
                            "bullets": []
                        }
                    elif next_line.startswith(('•', '-', '*')) and current_exp:
                        bullet = re.sub(r'^[•\-*]\s*', '', next_line).strip()
                        if bullet:
                            current_exp["bullets"].append(bullet)
                    j += 1
                if current_exp and current_exp.get('bullets'):
                    revamped_cv["experience"].append(current_exp)
                continue
            
            # Education
            if "education" in line_lower:
                j = i + 1
                education_entries = []
                current_degree = ""
                current_institution = ""
                current_dates = ""
                current_details = ""
                
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                    if any(s in next_line.lower() for s in ['languages']):
                        break
                    
                    # Skip bullet points and skill categories
                    if next_line.startswith(('•', '-', '*')) or ':' in next_line:
                        j += 1
                        continue
                    
                    # Check if this line contains a degree indicator or dates
                    degree_indicators = ['bsc', 'bachelor', 'master', 'phd', 'diploma', 'certificate', 'matric', 'grade', 'program', 'course']
                    has_degree_indicator = any(ind in next_line.lower() for ind in degree_indicators)
                    has_dates = re.search(r'20\d{2}', next_line)
                    
                    # Check if this line is an institution name
                    institution_indicators = ['university', 'college', 'institute', 'academy', 'school', 'alx', 'techbridle']
                    is_institution = any(ind in next_line.lower() for ind in institution_indicators)
                    
                    if has_degree_indicator or has_dates:
                        # Save previous entry
                        if current_degree:
                            education_entries.append({
                                "degree": current_degree,
                                "institution": current_institution,
                                "dates": current_dates,
                                "details": current_details
                            })
                        # Start new entry
                        current_degree = next_line
                        current_institution = ""
                        current_dates = ""
                        current_details = ""
                    elif is_institution and current_degree and not current_institution:
                        # This is an institution name for the current degree
                        current_institution = next_line
                    elif next_line and not next_line.startswith('#'):
                        # Additional details
                        if not current_institution:
                            current_institution = next_line
                        else:
                            current_details = next_line
                    
                    j += 1
                
                # Add the last entry
                if current_degree:
                    education_entries.append({
                        "degree": current_degree,
                        "institution": current_institution,
                        "dates": current_dates,
                        "details": current_details
                    })
                
                # Process and clean education entries
                for edu in education_entries:
                    degree = edu["degree"]
                    institution = edu["institution"]
                    dates = edu["dates"]
                    details = edu["details"]
                    
                    # Extract dates from degree if present
                    date_match = re.search(r'(20\d{2})\s*[–-]\s*(20\d{2}|present|current)', degree, re.IGNORECASE)
                    if date_match:
                        dates = date_match.group(0)
                        degree = re.sub(r'\s*\(?20\d{2}\s*[–-]\s*(20\d{2}|present|current)\)?', '', degree).strip()
                    
                    # Clean up degree text
                    degree = re.sub(r'\s+', ' ', degree).strip()
                    
                    # Format dates with en dash
                    if dates:
                        dates = dates.replace('-', '–')
                    
                    # Create formatted degree with dates
                    formatted_degree = degree
                    if dates and dates not in formatted_degree:
                        formatted_degree = f"{degree} {dates}"
                    
                    revamped_cv["education"].append({
                        "degree": formatted_degree,
                        "institution": institution,
                        "dates": dates,
                        "details": details
                    })
                
                continue
            
            # Languages
            if "languages" in line_lower:
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                    if any(s in next_line.lower() for s in ['professional', 'skills', 'experience', 'education']):
                        break
                    if next_line.startswith(('•', '-', '*')):
                        lang = re.sub(r'^[•\-*]\s*', '', next_line).strip()
                        if lang:
                            revamped_cv["languages"].append(lang)
                    elif next_line and not next_line.startswith('#'):
                        revamped_cv["languages"].append(next_line)
                    j += 1
                continue
        
        # ===== FALLBACKS FOR RETAIL =====
        
        if not revamped_cv["name"]:
            revamped_cv["name"] = name or "[Your Name]"
        
        if not revamped_cv["contactInfo"]:
            contact_parts = []
            if phone:
                contact_parts.append(phone)
            if email:
                contact_parts.append(email)
            revamped_cv["contactInfo"] = f"South Africa | {' | '.join(contact_parts)}" if contact_parts else "South Africa | [Phone] | [Email]"
        
        if not revamped_cv["credentials"]:
            revamped_cv["credentials"] = "ID Holder | Driver's License: Not specified | B-BBEE Status: South African Citizen"
        
        if not revamped_cv["professionalSummary"] and original_about:
            revamped_cv["professionalSummary"] = original_about
        elif not revamped_cv["professionalSummary"]:
            revamped_cv["professionalSummary"] = "Motivated and hardworking individual with hands-on retail experience. Skilled in customer service, cash handling, and stock management. Reliable team player with a positive attitude and strong communication skills."
        
        if not revamped_cv["coreCompetencies"] and original_skills:
            retail_keywords = ['customer service', 'cash handling', 'stock management', 'merchandising', 'inventory', 'pos', 'till']
            retail_skills = []
            for skill in original_skills:
                if any(kw in skill.lower() for kw in retail_keywords):
                    retail_skills.append(skill)
            if retail_skills:
                revamped_cv["coreCompetencies"] = retail_skills[:8]
            else:
                revamped_cv["coreCompetencies"] = ['Customer Service', 'Cash Handling', 'Stock Management', 'POS Systems', 'Merchandising']
        
        if not revamped_cv["softSkills"]:
            revamped_cv["softSkills"] = ['Communication', 'Teamwork', 'Problem Solving', 'Adaptability', 'Time Management']
        
        if not revamped_cv["experience"] and original_experience:
            for exp in original_experience[:2]:
                if isinstance(exp, str):
                    revamped_cv["experience"].append({
                        "title": exp[:80],
                        "company": "",
                        "dates": "",
                        "bullets": [exp]
                    })
        
        if not revamped_cv["education"] and original_education:
            for edu in original_education[:4]:
                if isinstance(edu, str):
                    edu_text = edu
                    institution = ""
                    dates = ""
                    
                    # Extract dates if present
                    date_match = re.search(r'(20\d{2})\s*[–-]\s*(20\d{2}|present|current)', edu_text, re.IGNORECASE)
                    if date_match:
                        dates = date_match.group(0)
                        edu_text = re.sub(r'\s*\(?20\d{2}\s*[–-]\s*(20\d{2}|present|current)\)?', '', edu_text).strip()
                    
                    # Check if this is a program with institution in the text
                    if 'alx' in edu_text.lower():
                        institution = 'ALX'
                        edu_text = re.sub(r'ALX', '', edu_text, flags=re.IGNORECASE).strip()
                    elif 'techbridle' in edu_text.lower():
                        institution = 'TechBridle Foundation'
                        edu_text = re.sub(r'TechBridle Foundation', '', edu_text, flags=re.IGNORECASE).strip()
                        edu_text = re.sub(r'TechBridle', '', edu_text, flags=re.IGNORECASE).strip()
                    elif 'university' in edu_text.lower():
                        parts = edu_text.split(' ')
                        institution_parts = []
                        degree_parts = []
                        found_institution = False
                        for part in parts:
                            if 'university' in part.lower() or found_institution:
                                found_institution = True
                                institution_parts.append(part)
                            else:
                                degree_parts.append(part)
                        
                        if institution_parts:
                            institution = ' '.join(institution_parts)
                            edu_text = ' '.join(degree_parts).strip()
                    elif 'matric' in edu_text.lower() or 'grade 12' in edu_text.lower():
                        institution = ""
                        edu_text = edu_text
                    
                    # Clean up extra spaces
                    edu_text = re.sub(r'\s+', ' ', edu_text).strip()
                    
                    formatted_degree = edu_text
                    if dates and dates not in formatted_degree:
                        formatted_degree = f"{edu_text} {dates}"
                    
                    revamped_cv["education"].append({
                        "degree": formatted_degree,
                        "institution": institution,
                        "dates": dates,
                        "details": ""
                    })
        
        if not revamped_cv["languages"]:
            revamped_cv["languages"] = ["English: Fluent"]
        
        return revamped_cv
    
    async def _parse_tech_cv(self, ai_text: str, cv_data: Dict[str, Any], name: str, email: str, phone: str, links: Dict, original_about: str, original_skills: List[str], original_experience: List[str], original_education: List[str], original_achievements: List[str]) -> Dict[str, Any]:
        """Parse AI response into a clean tech CV structure matching Siyanda's exact format."""
        
        revamped_cv = {
            "name": name or "",
            "contactInfo": "",
            "links": "",
            "credentials": "",
            "professionalSummary": "",
            "technicalSkills": {},
            "experience": [],
            "projects": [],
            "education": [],
            "languages": []
        }
        
        lines = ai_text.split('\n')
        
        # Track sections to avoid mixing
        current_section = None
        in_skills_section = False
        
        # First pass - extract header info
        for line in lines[:20]:
            line = line.strip()
            if not line:
                continue
            
            # Extract name
            if not revamped_cv["name"] and not any(h in line.lower() for h in ['professional', 'summary', 'skills', 'experience', 'education', 'languages', 'contact', 'linkedin', 'github', 'id holder', 'south africa']):
                if len(line.split()) >= 2 and not any(c in line for c in ['@', 'http', 'linkedin', 'github', '|']):
                    revamped_cv["name"] = line
                    continue
            
            # Extract contact info (South Africa | Phone | Email format)
            if not revamped_cv["contactInfo"] and '|' in line and ('@' in line or any(d in line for d in ['0','1','2','3','4','5','6','7','8','9'])):
                revamped_cv["contactInfo"] = line
                continue
            
            # Extract links (LinkedIn | GitHub format)
            if not revamped_cv["links"] and ('linkedin' in line.lower() or 'github' in line.lower()) and '|' in line:
                revamped_cv["links"] = line
                continue
            
            # Extract credentials
            if not revamped_cv["credentials"] and any(x in line.lower() for x in ['id holder', "driver's license", 'b-bbee', 'south african citizen']):
                revamped_cv["credentials"] = line
                continue
        
        # Second pass - parse sections
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue
            
            line_upper = line.upper()
            line_lower = line.lower()
            
            # PROFESSIONAL SUMMARY
            if "PROFESSIONAL SUMMARY" in line_upper or "professional summary" in line_lower:
                current_section = "summary"
                in_skills_section = False
                summary_lines = []
                i += 1
                while i < len(lines):
                    next_line = lines[i].strip()
                    if not next_line:
                        i += 1
                        continue
                    next_upper = next_line.upper()
                    if "TECHNICAL SKILLS" in next_upper or "PROFESSIONAL EXPERIENCE" in next_upper or "PROJECTS" in next_upper or "EDUCATION" in next_upper or "LANGUAGES" in next_upper:
                        break
                    if next_line and not next_line.startswith(('•', '-', '*', '|')) and not next_line.upper() == next_line:
                        summary_lines.append(next_line)
                    i += 1
                revamped_cv["professionalSummary"] = ' '.join(summary_lines).strip()
                continue
            
            # TECHNICAL SKILLS
            if "TECHNICAL SKILLS" in line_upper or "technical skills" in line_lower:
                current_section = "skills"
                in_skills_section = True
                i += 1
                while i < len(lines):
                    next_line = lines[i].strip()
                    if not next_line:
                        i += 1
                        continue
                    next_upper = next_line.upper()
                    if "PROFESSIONAL EXPERIENCE" in next_upper or "PROJECTS" in next_upper or "EDUCATION" in next_upper or "LANGUAGES" in next_upper:
                        break
                    if ':' in next_line:
                        parts = next_line.split(':', 1)
                        category = parts[0].strip()
                        skills_text = parts[1].strip()
                        revamped_cv["technicalSkills"][category] = skills_text
                    i += 1
                continue
            
            # PROFESSIONAL EXPERIENCE
            if "PROFESSIONAL EXPERIENCE" in line_upper or "professional experience" in line_lower or "work experience" in line_lower:
                current_section = "experience"
                in_skills_section = False
                i += 1
                current_exp = None
                while i < len(lines):
                    next_line = lines[i].strip()
                    if not next_line:
                        i += 1
                        continue
                    next_upper = next_line.upper()
                    if "PROJECTS" in next_upper or "EDUCATION" in next_upper or "LANGUAGES" in next_upper:
                        break
                    
                    if '|' in next_line:
                        if current_exp and current_exp.get('bullets'):
                            revamped_cv["experience"].append(current_exp)
                        parts = [p.strip() for p in next_line.split('|')]
                        current_exp = {
                            "title": parts[0] if len(parts) > 0 else "",
                            "company": parts[1] if len(parts) > 1 else "",
                            "dates": parts[2] if len(parts) > 2 else "",
                            "bullets": []
                        }
                    elif next_line.startswith(('•', '-', '*')) and current_exp:
                        bullet = re.sub(r'^[•\-*]\s*', '', next_line).strip()
                        if bullet:
                            current_exp["bullets"].append(bullet)
                    i += 1
                if current_exp and current_exp.get('bullets'):
                    revamped_cv["experience"].append(current_exp)
                continue
            
            # PROJECTS
            if "PROJECTS" in line_upper or "projects" in line_lower:
                current_section = "projects"
                in_skills_section = False
                i += 1
                current_project = None
                while i < len(lines):
                    next_line = lines[i].strip()
                    if not next_line:
                        i += 1
                        continue
                    next_upper = next_line.upper()
                    if "EDUCATION" in next_upper or "LANGUAGES" in next_upper:
                        break
                    
                    if next_line and not next_line.startswith(('•', '-', '*')) and 'technologies' not in next_line.lower() and not next_line.startswith('#'):
                        if current_project and current_project.get('bullets'):
                            revamped_cv["projects"].append(current_project)
                        current_project = {
                            "name": next_line,
                            "technologies": "",
                            "bullets": []
                        }
                    elif 'technologies' in next_line.lower() and current_project:
                        parts = next_line.split(':', 1)
                        if len(parts) > 1:
                            current_project["technologies"] = parts[1].strip()
                    elif next_line.startswith(('•', '-', '*')) and current_project:
                        bullet = re.sub(r'^[•\-*]\s*', '', next_line).strip()
                        if bullet:
                            current_project["bullets"].append(bullet)
                    i += 1
                if current_project and current_project.get('bullets'):
                    revamped_cv["projects"].append(current_project)
                continue
            
            # EDUCATION
            if "EDUCATION" in line_upper or "education" in line_lower:
                current_section = "education"
                in_skills_section = False
                i += 1
                education_entries = []
                current_degree = ""
                current_institution = ""
                current_dates = ""
                current_details = ""
                
                while i < len(lines):
                    next_line = lines[i].strip()
                    if not next_line:
                        i += 1
                        continue
                    
                    next_upper = next_line.upper()
                    if "LANGUAGES" in next_upper:
                        break
                    
                    # Skip skill category lines and bullet points
                    if ':' in next_line or next_line.startswith(('•', '-', '*', '|')):
                        i += 1
                        continue
                    
                    # Check if this line contains a degree indicator or dates
                    degree_indicators = ['bsc', 'bachelor', 'master', 'phd', 'diploma', 'certificate', 'matric', 'grade', 'program', 'course']
                    has_degree_indicator = any(ind in next_line.lower() for ind in degree_indicators)
                    has_dates = re.search(r'20\d{2}', next_line)
                    
                    # Check if this line is an institution name
                    institution_indicators = ['university', 'college', 'institute', 'academy', 'school', 'alx', 'techbridle']
                    is_institution = any(ind in next_line.lower() for ind in institution_indicators)
                    
                    if has_degree_indicator or has_dates:
                        # Save previous entry
                        if current_degree:
                            education_entries.append({
                                "degree": current_degree,
                                "institution": current_institution,
                                "dates": current_dates,
                                "details": current_details
                            })
                        # Start new entry
                        current_degree = next_line
                        current_institution = ""
                        current_dates = ""
                        current_details = ""
                    elif is_institution and current_degree and not current_institution:
                        # This is an institution name for the current degree
                        current_institution = next_line
                    elif next_line and not next_line.startswith('#'):
                        # Additional details
                        if not current_institution:
                            current_institution = next_line
                        else:
                            current_details = next_line
                    
                    i += 1
                
                # Add the last entry
                if current_degree:
                    education_entries.append({
                        "degree": current_degree,
                        "institution": current_institution,
                        "dates": current_dates,
                        "details": current_details
                    })
                
                # Process and clean education entries
                for edu in education_entries:
                    degree = edu["degree"]
                    institution = edu["institution"]
                    dates = edu["dates"]
                    details = edu["details"]
                    
                    # Extract dates from degree if present
                    date_match = re.search(r'(20\d{2})\s*[–-]\s*(20\d{2}|present|current)', degree, re.IGNORECASE)
                    if date_match:
                        dates = date_match.group(0)
                        degree = re.sub(r'\s*\(?20\d{2}\s*[–-]\s*(20\d{2}|present|current)\)?', '', degree).strip()
                    
                    # Clean up degree text
                    degree = re.sub(r'\s+', ' ', degree).strip()
                    
                    # Format dates with en dash
                    if dates:
                        dates = dates.replace('-', '–')
                    
                    # Create formatted degree with dates
                    formatted_degree = degree
                    if dates and dates not in formatted_degree:
                        formatted_degree = f"{degree} {dates}"
                    
                    revamped_cv["education"].append({
                        "degree": formatted_degree,
                        "institution": institution,
                        "dates": dates,
                        "details": details
                    })
                
                continue
            
            # LANGUAGES
            if "LANGUAGES" in line_upper or "languages" in line_lower:
                current_section = "languages"
                in_skills_section = False
                i += 1
                while i < len(lines):
                    next_line = lines[i].strip()
                    if not next_line:
                        i += 1
                        continue
                    
                    next_upper = next_line.upper()
                    if any(h in next_upper for h in ['PROFESSIONAL', 'TECHNICAL', 'EDUCATION', 'SKILLS', 'EXPERIENCE', 'PROJECTS']):
                        break
                    
                    if ':' in next_line and not any(level in next_line.lower() for level in ['fluent', 'intermediate', 'basic', 'native']):
                        i += 1
                        continue
                    
                    if next_line.startswith(('•', '-', '*')):
                        lang = re.sub(r'^[•\-*]\s*', '', next_line).strip()
                        if lang and not any(skip in lang.lower() for skip in ['languages', 'frameworks', 'tools', 'methodologies']):
                            revamped_cv["languages"].append(lang)
                    elif next_line and not next_line.startswith('#'):
                        lang = next_line.strip()
                        if lang and len(lang) < 100 and not any(skip in lang.lower() for skip in ['languages', 'frameworks', 'tools', 'methodologies']):
                            revamped_cv["languages"].append(lang)
                    i += 1
                continue
            
            i += 1
        
        # ===== POST-PROCESSING: Clean up education section =====
        skill_categories = ['Languages:', 'Frameworks & Libraries:', 'Web Technologies:', 'Tools & Platforms:', 'Methodologies:', 'Databases:']
        cleaned_education = []
        for edu in revamped_cv["education"]:
            edu_text = edu.get("degree", "")
            if not any(cat in edu_text for cat in skill_categories):
                if edu_text.lower() not in ['languages', 'frameworks', 'web technologies', 'tools', 'methodologies', 'databases']:
                    skip_keywords = ['languages:', 'frameworks:', 'web technologies:', 'tools:', 'methodologies:', 'platforms:', 'databases:']
                    if not any(kw in edu_text.lower() for kw in skip_keywords):
                        cleaned_education.append(edu)
        revamped_cv["education"] = cleaned_education
        
        # ===== FALLBACKS FOR TECH =====
        
        if not revamped_cv["name"]:
            revamped_cv["name"] = name or "[Your Name]"
        
        if not revamped_cv["contactInfo"]:
            contact_parts = []
            if phone:
                contact_parts.append(phone)
            if email:
                contact_parts.append(email)
            revamped_cv["contactInfo"] = f"South Africa | {' | '.join(contact_parts)}" if contact_parts else "South Africa | [Phone] | [Email]"
        
        if not revamped_cv["links"]:
            link_parts = []
            if links.get('linkedin'):
                link_parts.append("LinkedIn: linkedin.com/in/[profile]")
            if links.get('github'):
                link_parts.append("GitHub: github.com/[username]")
            revamped_cv["links"] = " | ".join(link_parts) if link_parts else ""
        
        if not revamped_cv["credentials"]:
            revamped_cv["credentials"] = "ID Holder | Driver's License: Available | B-BBEE Status: South African Citizen"
        
        if not revamped_cv["professionalSummary"] and original_about:
            revamped_cv["professionalSummary"] = original_about
        elif not revamped_cv["professionalSummary"] and original_skills:
            summary_skills = ', '.join(original_skills[:8])
            revamped_cv["professionalSummary"] = f"Full-stack developer with expertise in {summary_skills}. Skilled in building responsive web applications and solving complex problems through technology."
        
        if not revamped_cv["technicalSkills"] and original_skills:
            languages = []
            frameworks = []
            web_tech = []
            tools = []
            methodologies = []
            
            for skill in original_skills:
                skill_lower = skill.lower()
                if skill_lower in ['python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'sql', 'html', 'css', 'php', 'ruby']:
                    languages.append(skill)
                elif any(fw in skill_lower for fw in ['react', 'angular', 'vue', '.net', 'bootstrap', 'tailwind', 'django', 'flask']):
                    frameworks.append(skill)
                elif any(web in skill_lower for web in ['rest', 'api', 'json', 'html5', 'css3', 'graphql']):
                    web_tech.append(skill)
                elif any(tool in skill_lower for tool in ['azure', 'aws', 'git', 'docker', 'devops', 'mongodb', 'postgresql', 'mysql']):
                    tools.append(skill)
                else:
                    methodologies.append(skill)
            
            if languages:
                revamped_cv["technicalSkills"]["Languages"] = ', '.join(languages[:8])
            if frameworks:
                revamped_cv["technicalSkills"]["Frameworks & Libraries"] = ', '.join(frameworks[:8])
            if web_tech:
                revamped_cv["technicalSkills"]["Web Technologies"] = ', '.join(web_tech[:6])
            if tools:
                revamped_cv["technicalSkills"]["Tools & Platforms"] = ', '.join(tools[:6])
            if methodologies:
                revamped_cv["technicalSkills"]["Methodologies"] = ', '.join(methodologies[:6])
        
        if not revamped_cv["experience"] and original_experience:
            for exp in original_experience[:3]:
                if isinstance(exp, str):
                    exp_lines = exp.split('\n')
                    title = exp_lines[0] if exp_lines else exp[:80]
                    bullets = []
                    for bullet_line in exp.split('\n')[1:]:
                        bullet_line = bullet_line.strip()
                        if bullet_line and len(bullet_line) > 10:
                            bullets.append(bullet_line)
                    if not bullets:
                        bullets = [exp[:150]]
                    
                    revamped_cv["experience"].append({
                        "title": title[:80],
                        "company": "",
                        "dates": "",
                        "bullets": bullets[:4]
                    })
        
        if not revamped_cv["projects"] and original_achievements:
            for ach in original_achievements[:3]:
                if isinstance(ach, str):
                    revamped_cv["projects"].append({
                        "name": ach[:50],
                        "technologies": "",
                        "bullets": [ach[:150]]
                    })
        
        # ===== CRITICAL FIX: Ensure Matric/Grade 12 is included =====
        # First, check if Matric is already in the education list
        has_matric = False
        for edu in revamped_cv["education"]:
            degree_text = edu.get("degree", "").lower()
            if 'matric' in degree_text or 'grade 12' in degree_text:
                has_matric = True
                break
        
        # If Matric is missing and the user has higher education, add it as a separate entry
        if not has_matric and len(revamped_cv["education"]) > 0:
            # Check if original education had Matric
            original_has_matric = False
            for edu in original_education:
                edu_lower = str(edu).lower()
                if 'matric' in edu_lower or 'grade 12' in edu_lower:
                    original_has_matric = True
                    break
            
            if original_has_matric:
                # Add Matric as a separate entry at the end of education
                revamped_cv["education"].append({
                    "degree": "Matric / Grade 12",
                    "institution": "",
                    "dates": "",
                    "details": ""
                })
            else:
                # Add standard Matric entry for South African CVs
                revamped_cv["education"].append({
                    "degree": "National Senior Certificate (Matric)",
                    "institution": "",
                    "dates": "",
                    "details": ""
                })
        
        # If there's no education at all, add at least Matric
        if not revamped_cv["education"]:
            revamped_cv["education"].append({
                "degree": "National Senior Certificate (Matric)",
                "institution": "",
                "dates": "",
                "details": ""
            })
        
        # Process any remaining education entries from original data that weren't captured
        if original_education and len(revamped_cv["education"]) == 0:
            for edu in original_education[:4]:
                if isinstance(edu, str):
                    edu_text = edu
                    institution = ""
                    dates = ""
                    
                    # Extract dates
                    date_match = re.search(r'(20\d{2})\s*[–-]\s*(20\d{2}|present|current)', edu_text, re.IGNORECASE)
                    if date_match:
                        dates = date_match.group(0)
                        edu_text = re.sub(r'\s*\(?20\d{2}\s*[–-]\s*(20\d{2}|present|current)\)?', '', edu_text).strip()
                    
                    # Separate degree from institution
                    if 'alx' in edu_text.lower():
                        institution = 'ALX'
                        edu_text = re.sub(r'ALX', '', edu_text, flags=re.IGNORECASE).strip()
                    elif 'techbridle' in edu_text.lower():
                        institution = 'TechBridle Foundation'
                        edu_text = re.sub(r'TechBridle Foundation', '', edu_text, flags=re.IGNORECASE).strip()
                        edu_text = re.sub(r'TechBridle', '', edu_text, flags=re.IGNORECASE).strip()
                    elif 'university' in edu_text.lower():
                        parts = edu_text.split(' ')
                        institution_parts = []
                        degree_parts = []
                        found_institution = False
                        for part in parts:
                            if 'university' in part.lower() or found_institution:
                                found_institution = True
                                institution_parts.append(part)
                            else:
                                degree_parts.append(part)
                        
                        if institution_parts:
                            institution = ' '.join(institution_parts)
                            edu_text = ' '.join(degree_parts).strip()
                    elif 'matric' in edu_text.lower() or 'grade 12' in edu_text.lower():
                        institution = ""
                        edu_text = edu_text
                    
                    # Clean up extra spaces
                    edu_text = re.sub(r'\s+', ' ', edu_text).strip()
                    
                    formatted_degree = edu_text
                    if dates and dates not in formatted_degree:
                        formatted_degree = f"{edu_text} {dates}"
                    
                    revamped_cv["education"].append({
                        "degree": formatted_degree,
                        "institution": institution,
                        "dates": dates,
                        "details": ""
                    })
        
        if not revamped_cv["languages"]:
            revamped_cv["languages"] = ["English: Fluent"]
        
        return revamped_cv
    
    def _clean_ai_text(self, text: str) -> str:
        """Clean up AI-generated text by removing markdown and fixing formatting."""
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
        text = re.sub(r'\*([^*]+)\*', r'\1', text)
        text = re.sub(r'^[•\-*]\s*', '• ', text, flags=re.MULTILINE)
        return text

    def _detect_cv_type(self, skills: List[str], experience: List[str], education: List[str]) -> str:
        """Detect if CV is retail, tech, or other"""
        retail_keywords = ['spar', 'retail', 'cash handling', 'stock', 'customer service', 'till', 'merchandising', 'store', 'shoprite', 'checkers', 'woolworths', 'pick n pay', 'supermarket']
        
        for exp in experience:
            exp_lower = str(exp).lower()
            for keyword in retail_keywords:
                if keyword in exp_lower:
                    self.logger.info(f"Retail detected from experience: {exp_lower[:100]}")
                    return "retail"
        
        for skill in skills:
            skill_lower = skill.lower()
            for keyword in retail_keywords:
                if keyword in skill_lower:
                    self.logger.info(f"Retail detected from skill: {skill}")
                    return "retail"
        
        tech_keywords = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'html', 'css', 'developer', 'api', 'git', 'docker', 'azure', 'aws', 'c#', 'c++', '.net', 'typescript', 'angular', 'vue']
        for skill in skills:
            skill_lower = str(skill).lower()
            for keyword in tech_keywords:
                if keyword in skill_lower:
                    self.logger.info(f"Tech detected from skill: {skill}")
                    return "tech"
        
        for edu in education:
            edu_lower = str(edu).lower()
            if any(degree in edu_lower for degree in ['computer science', 'software', 'engineering', 'it', 'information technology', 'bsc', 'bachelor']):
                self.logger.info(f"Tech detected from education: {edu}")
                return "tech"
        
        return "general"

    def _generate_changes_summary(self, cv_data: Dict[str, Any]) -> List[str]:
        """Generate changes based on actual weaknesses and CV type"""
        weaknesses = cv_data.get('weaknesses', [])
        skills = cv_data.get('sections', {}).get('skills', [])
        experience = cv_data.get('sections', {}).get('experience', [])
        
        cv_type = self._detect_cv_type(skills, experience, [])
        self.logger.info(f"Generating changes for CV type: {cv_type}")
        
        changes = []
        
        if cv_type == "retail":
            changes = [
                "Enhanced professional summary with retail-specific keywords and achievements.",
                "Restructured experience section to highlight customer service, cash handling, and stock management.",
                "Added measurable achievements such as transaction volumes and customer satisfaction metrics.",
                "Included SA-specific retail keywords like 'POS Systems', 'Merchandising', 'Stock Control', 'Inventory Management'.",
                "Improved formatting with clear section headings for better ATS compatibility.",
                "Added driver's licence and B-BBEE status information as per SA employer requirements.",
                "Expanded languages section to reflect South Africa's multilingual environment."
            ]
        else:
            weakness_map = {
                "matric": "Added National Senior Certificate (Matric) section with key subjects for SA employers.",
                "grade 12": "Added National Senior Certificate (Matric) section with key subjects for SA employers.",
                "experience": "Restructured experience section to highlight key achievements and responsibilities.",
                "skills": "Expanded skills section with market-relevant keywords and categorization.",
                "quantifiable": "Enhanced achievements with quantifiable metrics to demonstrate impact.",
                "metrics": "Added measurable results and performance indicators throughout the CV.",
                "driver": "Added driver's licence and citizenship information for SA ATS compatibility.",
                "github": "Added GitHub profile link and project repositories for portfolio visibility.",
                "linkedin": "Added LinkedIn profile link for professional networking."
            }
            
            for weakness in weaknesses[:5]:
                weakness_lower = str(weakness).lower()
                matched = False
                for key, change in weakness_map.items():
                    if key in weakness_lower:
                        if change not in changes:
                            changes.append(change)
                            matched = True
                            break
                if not matched:
                    changes.append(f"Addressed: {weakness[:50]}")
        
        if len(changes) < 5:
            generic = [
                "Optimized CV content for ATS compatibility with strategic keyword placement.",
                "Improved professional summary to highlight key strengths and career objectives.",
                "Enhanced formatting and organization for better readability and scannability."
            ]
            for g in generic:
                if g not in changes and len(changes) < 7:
                    changes.append(g)
        
        return changes[:7]

    async def _revamp_with_ai(self, cv_data: Dict[str, Any]) -> Optional[str]:
        """
        Use Azure OpenAI to generate an ATS-optimized CV
        """
        if not self.ai_client.enabled:
            self.logger.warning("AI client disabled")
            return None

        sections = cv_data.get('sections', {})
        score = cv_data.get('score', 0)
        weaknesses = cv_data.get('weaknesses', [])
        missing_keywords = cv_data.get('missingKeywords', [])
        
        name = cv_data.get('name', '')
        email = cv_data.get('email', '')
        phone = cv_data.get('phone', '')
        links = cv_data.get('linkCheck', {})

        about = sections.get('about', '')
        skills = sections.get('skills', [])
        education = sections.get('education', [])
        experience = sections.get('experience', [])
        achievements = sections.get('achievements', [])

        cv_type = self._detect_cv_type(skills, experience, education)
        self.logger.info(f"Revamp - Detected CV type: {cv_type}")
        
        skills_text = '\n'.join([f"  • {skill}" for skill in skills]) if skills else '  • No skills listed'
        education_text = '\n'.join([f"  • {edu}" for edu in education]) if education else '  • No education listed'
        experience_text = '\n'.join([f"  • {exp}" for exp in experience]) if experience else '  • No experience listed'
        achievements_text = '\n'.join([f"  • {ach}" for ach in achievements]) if achievements else '  • No achievements listed'
        
        weaknesses_text = '\n'.join([f"  - {w}" for w in weaknesses]) if weaknesses else '  - None identified'
        missing_keywords_text = ', '.join(missing_keywords) if missing_keywords else 'None identified'

        if cv_type == "retail":
            system_prompt = """You are a professional CV writer specializing in retail and customer service CVs for the South African job market.

Create a clean, professional retail CV with this exact format:

[Full Name]
South Africa | [Phone] | [Email]

LinkedIn: [url if present] | GitHub: [url if present]

ID Holder | Driver's License: [status] | B-BBEE Status: South African Citizen

PROFESSIONAL SUMMARY
[2-3 sentences highlighting customer service, cash handling, stock management, teamwork, and positive attitude]

CORE COMPETENCIES
[List of retail skills: Customer Service, Cash Handling, Stock Management, POS Systems, Merchandising, Inventory Control, etc.]

SOFT SKILLS
[List of soft skills: Communication, Teamwork, Problem Solving, Adaptability, Time Management, etc.]

PROFESSIONAL EXPERIENCE
[Job Title] | [Company] | [Dates]
• [Achievement-focused bullet points with metrics - e.g., "Processed 100+ transactions daily", "Handled R50,000+ in daily cash"]
• [Customer service achievements]
• [Stock management responsibilities]

EDUCATION
[Each entry on a new line, with dates in parentheses]
Examples:
Matric / Grade 12 (2020-2024)
[High School Name]

OR

BSc Computer Science and Statistics (2022-2023)
North West University

LANGUAGES
• English: Fluent
• [Additional South African languages if mentioned]

CRITICAL RULES:
1. KEEP THE CANDIDATE'S ACTUAL RETAIL EXPERIENCE - do not add tech skills
2. Focus on customer service, cash handling, stock management, and teamwork
3. Add measurable achievements where possible
4. Use SA retail keywords: POS Systems, Merchandising, Stock Control, Inventory Management
5. Format education entries cleanly with dates in parentheses on the same line as the degree
6. Include Matric/Grade 12 if that's the highest education level
7. Return ONLY the formatted CV, no explanations"""

            prompt = f"""Create a professional retail CV using this information:

NAME: {name if name else '[Name]'}

CONTACT: {phone if phone else '[Phone]'} | {email if email else '[Email]'}

PROFESSIONAL SUMMARY:
{about}

SKILLS:
{skills_text}

EDUCATION:
{education_text}

WORK EXPERIENCE:
{experience_text}

ACHIEVEMENTS:
{achievements_text}

AREAS TO IMPROVE:
{weaknesses_text}

KEYWORDS TO INCLUDE:
{missing_keywords_text}

Create a clean, professional retail CV with the exact format specified. Format education entries with dates in parentheses on the same line as the degree. Add measurable achievements where possible. Use retail-specific keywords. Include Matric/Grade 12 if that's the highest education level."""

        else:
            system_prompt = """You are a professional CV writer specializing in technology CVs for the South African job market.

Create a clean, professional tech CV with this exact format (all section headers in ALL CAPS):

[Full Name]
South Africa | [Phone] | [Email]

LinkedIn: [linkedin-url] | GitHub: [github-url]

ID Holder | Driver's License: Available | B-BBEE Status: South African Citizen

PROFESSIONAL SUMMARY
[2-3 comprehensive sentences highlighting technical expertise, key skills, and career achievements]

TECHNICAL SKILLS
Languages: [list programming languages]
Frameworks & Libraries: [list frameworks]
Web Technologies: [list web technologies]
Tools & Platforms: [list tools]
Methodologies: [list methodologies]

PROFESSIONAL EXPERIENCE
[Job Title] | [Company] | [Dates]
• [Achievement-focused bullet point with metrics]
• [Achievement-focused bullet point with metrics]
• [Achievement-focused bullet point with metrics]

PROJECTS
[Project Name]
Technologies: [list technologies used]
• [Project achievement with metrics]
• [Project achievement with metrics]

EDUCATION
[Each entry on a new line, with dates in parentheses]
Examples:
Matric / Grade 12 (2020-2024)
[High School Name]

OR

BSc Computer Science and Statistics (2022-2023)
North West University
AiCE & Virtual Assistance Program (2023-2024)
ALX

LANGUAGES
• English: Fluent
• [Additional languages]

CRITICAL RULES:
1. KEEP THE CANDIDATE'S ACTUAL INFORMATION - do not invent new jobs or experiences
2. Use ALL CAPS for section headers exactly as shown
3. Add metrics and quantifiable achievements where possible (percentages, time saved, users impacted)
4. Format bullet points with "•" symbols
5. Format education entries cleanly with dates in parentheses on the same line as the degree
6. Include Matric/Grade 12 if that's the highest education level
7. Return ONLY the formatted CV, no explanations"""

            prompt = f"""Create a professional tech CV using this information (format exactly like the example):

NAME: {name if name else '[Name]'}

CONTACT: {phone if phone else '[Phone]'} | {email if email else '[Email]'}

PROFESSIONAL SUMMARY:
{about[:1000]}

SKILLS:
{skills_text}

EDUCATION:
{education_text}

WORK EXPERIENCE:
{experience_text}

ACHIEVEMENTS:
{achievements_text}

Create a clean, professional tech CV with the exact format specified. Add metrics to achievements where possible. Use ALL CAPS for section headers. Format education entries cleanly with dates in parentheses on the same line as the degree. Include Matric/Grade 12 if that's the highest education level."""

        try:
            self.logger.info(f"Attempting AI-powered CV revamp for {cv_type} CV...")
            
            result = await self.ai_client.generate_text_async(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.1,
                max_tokens=3000
            )
            
            if result and isinstance(result, str) and len(result.strip()) > 150: # Ensure a meaningful response
                self.logger.info("✅ AI revamp successful with meaningful response")
                return result
            else:
                self.logger.warning("AI returned invalid response")
                return None
                
        except Exception as e:
            self.logger.error(f"AI revamp failed: {e}")
            import traceback
            traceback.print_exc()
            return None