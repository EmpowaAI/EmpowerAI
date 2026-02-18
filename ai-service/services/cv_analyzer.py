"""
CV Analyzer Service
Extracts skills, identifies gaps, and suggests improvements
Uses Azure OpenAI when available, with rule-based fallback.
"""

from typing import List, Dict, Any, Optional
import sys
import os
import re
import json
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openai import RateLimitError
from utils.ai_client import AIClient

class CVAnalyzer:
    """Analyzes CVs and extracts information"""

    def __init__(self, ai_client: Optional[AIClient] = None):
        self.ai_client = ai_client or AIClient()

        # Comprehensive skill list (used for fallback)
        self.skill_keywords = [
            'python', 'javascript', 'react', 'node', 'sql', 'html', 'css',
            'communication', 'leadership', 'teamwork', 'problem solving',
            'excel', 'word', 'powerpoint', 'customer service', 'sales',
            'java', 'c++', 'ruby', 'php', 'aws', 'azure', 'docker',
            'kubernetes', 'mongodb', 'postgresql', 'mysql', 'git',
            'agile', 'scrum', 'project management', 'data analysis',
            'machine learning', 'ai', 'frontend', 'backend', 'fullstack',
            'ui/ux', 'design', 'figma', 'sketch', 'photoshop',
            'marketing', 'seo', 'social media', 'content writing',
            'public speaking', 'negotiation', 'critical thinking',
            'c#', 'asp.net', '.net', 'typescript', 'restful apis', 'nosql',
            'devops', 'sdlc', 'virtual assistant', 'email management',
            'calendar management', 'office 365', 'microsoft office',
            'bootstrap', 'tailwind', 'material ui', 'chakra ui',
            'next.js', 'graphql', 'redux', 'jest', 'ci/cd', 'unit testing',
            'microservices', 'jira', 'confluence', 'typing', 'fast learner',
            'flexible', 'creative thinking', 'cash handling', 'stock management',
            'inventory', 'merchandising', 'cleaning', 'organization',
            'time management', 'multitasking', 'reliable', 'hardworking',
            'motivated', 'positive attitude', 'team player', 'independent',
            'grade 12', 'matric', 'high school'
        ]

        self.market_keywords_map = {
            'python': ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy', 'Data Science'],
            'javascript': ['TypeScript', 'Node.js', 'React', 'Vue', 'Angular', 'Jest'],
            'typescript': ['Type Safety', 'Interfaces', 'Generics', 'Decorators'],
            'react': ['Next.js', 'React Hooks', 'Context API', 'Redux', 'React Router'],
            'java': ['Spring Boot', 'Hibernate', 'Maven', 'JUnit', 'Microservices'],
            'c#': ['.NET Core', 'ASP.NET Core', 'Entity Framework', 'LINQ', 'Blazor'],
            'c++': ['STL', 'Boost', 'CMake', 'Qt', 'Modern C++'],
            'sql': ['Query Optimization', 'Database Design', 'Indexing', 'Stored Procedures'],
            'mongodb': ['Aggregation Pipeline', 'Indexes', 'Mongoose', 'NoSQL Design'],
            'docker': ['Kubernetes', 'Docker Compose', 'Container Registry', 'Containerization'],
            'kubernetes': ['Pods', 'Services', 'Ingress', 'Helm', 'Kustomize'],
            'aws': ['EC2', 'S3', 'Lambda', 'RDS', 'DynamoDB', 'API Gateway'],
            'azure': ['Azure Functions', 'App Services', 'Cosmos DB', 'Azure DevOps'],
            'git': ['GitHub Actions', 'Git Flow', 'Branching Strategy', 'CI/CD'],
            'devops': ['CI/CD Pipelines', 'Infrastructure as Code', 'Monitoring', 'Logging'],
            'virtual assistant': ['Email Management', 'Calendar Management', 'Travel Coordination', 'Task Automation'],
            'customer service': ['Client Relations', 'Problem Resolution', 'Communication', 'CRM'],
            'communication': ['Interpersonal Skills', 'Verbal Communication', 'Written Communication', 'Presentation'],
            'problem solving': ['Analytical Thinking', 'Critical Thinking', 'Troubleshooting', 'Decision Making'],
            'sales': ['Lead Generation', 'Closing Deals', 'Customer Acquisition', 'Relationship Building'],
            'retail': ['Inventory Management', 'Merchandising', 'Point of Sale', 'Stock Control']
        }

        self.common_misspellings = {
            'tialwind': 'Tailwind CSS',
            'bootstraps': 'Bootstrap',
            'calender': 'Calendar',
            'miscrosoft': 'Microsoft',
            'javscript': 'JavaScript',
            'typscript': 'TypeScript',
            'reacct': 'React',
            'rect': 'React',
            'phython': 'Python',
            'c##': 'C#',
            'c ++': 'C++',
            'asp.net': 'ASP.NET',
            'restfull': 'RESTful',
            'mongodb': 'MongoDB',
            'azue': 'Azure',
            'dockr': 'Docker',
            'kubenetes': 'Kubernetes'
        }

        self.context = {}

    # ----------------------------------------------------------------------
    # AI‑powered extraction (primary method) – async
    # ----------------------------------------------------------------------
    async def _analyze_with_ai(self, cv_text: str) -> Optional[Dict[str, Any]]:
        """
        Use Azure OpenAI to extract structured information from the CV.
        Returns a dict with keys: about, skills, education, experience,
        achievements, links (with linkedin/github/portfolio booleans).
        Returns None if AI fails or is disabled.
        """
        if not self.ai_client.enabled:
            return None

        system_prompt = (
            "You are a CV analysis expert. Extract the following information from the CV text "
            "and return a valid JSON object with these exact keys:\n"
            "- about: a concise professional summary (string)\n"
            "- skills: an array of skill names (strings)\n"
            "- education: an array of education entries, each as a string (e.g. 'BSc Computer Science, University of XYZ, 2020-2024')\n"
            "- experience: an array of work experience entries, each as a string (e.g. 'Software Developer at ABC Corp, 2022-present')\n"
            "- achievements: an array of notable achievements (strings)\n"
            "- links: an object with boolean fields 'linkedin', 'github', 'portfolio' indicating presence of those links\n\n"
            "If a section is missing, return an empty array for that field. Do not include any explanations or markdown."
        )

        prompt = f"CV text:\n\n{cv_text[:4000]}"  # limit length to avoid token overflow

        try:
            result = await self.ai_client.generate_structured_response_async(
                prompt=prompt,
                system_prompt=system_prompt,
                response_schema={},  # not used for JSON mode, we rely on instructions
                temperature=0.3,
                max_tokens=1500,
                retry_on_fail=True
            )
            if result and isinstance(result, dict):
                # Ensure all expected keys exist
                expected_keys = ['about', 'skills', 'education', 'experience', 'achievements', 'links']
                for key in expected_keys:
                    if key not in result:
                        result[key] = [] if key not in ('about', 'links') else ('' if key == 'about' else {})
                # Ensure links object has the three booleans
                links = result.get('links', {})
                for link in ['linkedin', 'github', 'portfolio']:
                    if link not in links:
                        links[link] = False
                result['links'] = links
                return result
        except Exception as e:
            print(f"AI analysis failed: {e}")
        return None

    # ----------------------------------------------------------------------
    # Rule‑based extraction methods (fallback) – all return safe defaults
    # ----------------------------------------------------------------------
    def extract_text_sections(self, cv_text: str) -> Dict[str, str]:
        """Extract different sections from CV text"""
        sections = {
            'about': '',
            'skills': '',
            'education': '',
            'experience': '',
            'projects': '',
            'achievements': ''
        }

        lines = cv_text.split('\n')
        current_section = None
        section_content = []

        # Section headers with variations
        section_headers = {
            'about': ['about me', 'profile', 'summary', 'professional summary', 'personal statement', 'about'],
            'skills': ['skills', 'technical skills', 'core competencies', 'expertise', 'technologies', 'competencies'],
            'education': ['education', 'academic background', 'qualifications', 'training', 'academic', 'qualifications'],
            'experience': ['experience', 'work experience', 'employment', 'work history', 'professional experience', 'work'],
            'projects': ['projects', 'personal projects', 'key projects', 'project experience', 'project'],
            'achievements': ['achievements', 'accomplishments', 'awards', 'honors', 'achievement']
        }

        for line in lines:
            line_lower = line.lower().strip()

            found_section = None
            for section, headers in section_headers.items():
                if any(header in line_lower for header in headers) and len(line) < 50:
                    if current_section and section_content:
                        sections[current_section] = '\n'.join(section_content).strip()
                    current_section = section
                    section_content = []
                    found_section = section
                    break

            if not found_section and current_section:
                if line.strip():
                    section_content.append(line.strip())

        if current_section and section_content:
            sections[current_section] = '\n'.join(section_content).strip()

        return sections

    def extract_skills(self, cv_text: str) -> List[str]:
        """Extract skills from CV text (rule-based) – always returns list."""
        if not cv_text or not cv_text.strip():
            return []

        found_skills = set()
        cv_lower = cv_text.lower()

        for skill in self.skill_keywords:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, cv_lower):
                # Format skill properly
                if skill in ['html', 'css', 'sql', 'nosql', 'aws', 'azure', 'gcp', 'ci/cd']:
                    found_skills.add(skill.upper())
                elif skill == 'c#':
                    found_skills.add('C#')
                elif skill == '.net':
                    found_skills.add('.NET')
                elif skill == 'c++':
                    found_skills.add('C++')
                elif skill == 'node.js':
                    found_skills.add('Node.js')
                elif skill in ['javascript', 'typescript', 'python', 'java', 'ruby', 'php']:
                    found_skills.add(skill.capitalize())
                else:
                    words = skill.split()
                    capitalized = ' '.join(w.capitalize() for w in words)
                    found_skills.add(capitalized)

        # Check for compound skills
        compound_skills = [
            ('machine learning', 'Machine Learning'),
            ('artificial intelligence', 'AI'),
            ('data science', 'Data Science'),
            ('web development', 'Web Development'),
            ('software development', 'Software Development'),
            ('full stack', 'Full Stack'),
            ('front end', 'Frontend'),
            ('back end', 'Backend'),
            ('rest api', 'REST APIs'),
            ('restful api', 'REST APIs'),
            ('problem solving', 'Problem Solving'),
            ('critical thinking', 'Critical Thinking'),
            ('project management', 'Project Management'),
            ('virtual assistant', 'Virtual Assistant'),
            ('email management', 'Email Management'),
            ('calendar management', 'Calendar Management'),
            ('customer service', 'Customer Service'),
            ('fast learner', 'Fast Learner'),
            ('creative thinking', 'Creative Thinking'),
            ('typing skills', 'Typing Skills'),
            ('cash handling', 'Cash Handling'),
            ('stock management', 'Stock Management'),
            ('time management', 'Time Management'),
            ('team player', 'Team Player'),
            ('positive attitude', 'Positive Attitude')
        ]

        for skill_text, display_name in compound_skills:
            if skill_text in cv_lower:
                found_skills.add(display_name)

        return sorted(list(found_skills)) if found_skills else []

    def extract_about_section(self, cv_text: str) -> str:
        """Extract professional summary/about section – always returns string."""
        if not cv_text:
            return ""

        sections = self.extract_text_sections(cv_text)
        if sections['about'] and len(sections['about']) > 30:
            about = sections['about']
            about = re.sub(r'\s+', ' ', about)
            about = re.sub(r'[^\w\s\.,;:\'\"\-\(\)]', '', about)
            if not about.endswith('.'):
                about += '.'
            return about

        lines = cv_text.split('\n')
        about_candidates = []

        for i, line in enumerate(lines):
            line = line.strip()
            if len(line) > 50 and any(word in line.lower() for word in
                                     ['developer', 'engineer', 'professional', 'experienced',
                                      'passionate', 'skilled', 'expert', 'specialize',
                                      'motivated', 'hardworking', 'individual', 'dedicated',
                                      'enthusiastic', 'detail-oriented', 'results-driven']):
                about_candidates.append(line)

        if about_candidates:
            about = ' '.join(about_candidates[:2])
            about = re.sub(r'\s+', ' ', about)
            about = re.sub(r'[^\w\s\.,;:\'\"\-\(\)]', '', about)
            if not about.endswith('.'):
                about += '.'
            return about

        return ""

    def extract_education(self, cv_text: str) -> List[str]:
        """Extract education entries with complete information – always returns list."""
        if not cv_text:
            return []

        education_entries = []
        seen_entries = set()
        lines = cv_text.split('\n')
        in_education = False
        edu_lines = []

        # Try to locate Education section
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(word in line_lower for word in ['education', 'academic', 'qualifications', 'training']):
                in_education = True
                continue
            if in_education:
                if any(word in line_lower for word in ['experience', 'skills', 'projects', 'work', 'employment', 'about', 'contact']):
                    break
                if line.strip():
                    edu_lines.append(line.strip())

        # Parse lines inside education section
        if edu_lines:
            current_entry = []
            for line in edu_lines:
                line = line.strip()
                if re.search(r'20\d{2}', line) or re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)', line.lower()):
                    if current_entry:
                        entry_text = ' '.join(current_entry)
                        formatted_entry = self._format_education_entry(entry_text)
                        if formatted_entry and formatted_entry not in seen_entries:
                            seen_entries.add(formatted_entry)
                            education_entries.append(formatted_entry)
                        current_entry = [line]
                    else:
                        current_entry.append(line)
                elif line and not line.startswith(('•', '-', '*', '○', '●')):
                    current_entry.append(line)
            if current_entry:
                entry_text = ' '.join(current_entry)
                formatted_entry = self._format_education_entry(entry_text)
                if formatted_entry and formatted_entry not in seen_entries:
                    seen_entries.add(formatted_entry)
                    education_entries.append(formatted_entry)

        # If still no entries, use regex patterns on full text
        if not education_entries:
            # Pattern 1: Institution, Program (Year-Year)
            pattern1 = r'([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation|High School|Secondary))[,\s]+([A-Za-z\s]+(?:Development|Science|Engineering|Technology|Program|Certificate|Course|Diploma|Degree)?)[,\s]*\(?(\d{4})\s*[-–]\s*(\d{4}|present|current)\)?'
            matches = re.findall(pattern1, cv_text, re.IGNORECASE)
            for match in matches:
                entry = f"{match[0]}, {match[1]} ({match[2]}-{match[3]})"
                education_entries.append(entry)

            # Pattern 2: Year-Year | Institution, Program
            pattern2 = r'(\d{4})\s*[-–]\s*(\d{4}|present|current)\s*[|,]\s*([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation))[,\s]+([A-Za-z\s]+)'
            matches = re.findall(pattern2, cv_text, re.IGNORECASE)
            for match in matches:
                entry = f"{match[2]}, {match[3]} ({match[0]}-{match[1]})"
                education_entries.append(entry)

            # Pattern 3: Institution - Program (Year)
            pattern3 = r'([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation))\s*[-–]\s*([A-Za-z\s]+(?:Development|Science|Engineering|Technology)?)[,\s]*\(?(\d{4})\)?'
            matches = re.findall(pattern3, cv_text, re.IGNORECASE)
            for match in matches:
                entry = f"{match[0]}, {match[1]} ({match[2]})"
                education_entries.append(entry)

            # Pattern 4: Matric/Grade 12
            pattern4 = r'(Matric|Grade\s*12|High\s*School)[,\s]*([A-Za-z\s]+(?:High\s*School|Secondary))?[,\s]*\(?(\d{4})\)?'
            matches = re.findall(pattern4, cv_text, re.IGNORECASE)
            for match in matches:
                entry = f"{match[0]} - {match[1]} ({match[2]})" if match[1] else f"{match[0]} ({match[2]})"
                education_entries.append(entry)

            # Pattern 5: Simple year with institution (for PDF case)
            pattern5 = r'(\d{4})\s*[-–]?\s*(\d{4})\s*([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation))\s*([A-Za-z\s]+)'
            matches = re.findall(pattern5, cv_text, re.IGNORECASE)
            for match in matches:
                entry = f"{match[2]}, {match[3]} ({match[0]}-{match[1]})"
                education_entries.append(entry)

        # Format and deduplicate
        formatted_entries = []
        seen_lower = set()
        for entry in education_entries:
            # Fix common institution names
            entry = re.sub(r'\btechbridle\b', 'TechBridle Foundation', entry, flags=re.IGNORECASE)
            entry = re.sub(r'\btech bridle\b', 'TechBridle Foundation', entry, flags=re.IGNORECASE)
            entry = re.sub(r'\bnwu\b', 'North West University', entry, flags=re.IGNORECASE)
            entry = re.sub(r'\bnorth west university\b', 'North West University', entry, flags=re.IGNORECASE)
            entry = re.sub(r'\bnorth-west university\b', 'North West University', entry, flags=re.IGNORECASE)
            entry = re.sub(r'\balx\b', 'ALX', entry, flags=re.IGNORECASE)

            # Clean up program names
            if 'computer science' in entry.lower() and 'bsc' not in entry.lower():
                entry = re.sub(r'computer science', 'BSc Computer Science', entry, flags=re.IGNORECASE)
            if 'software development' in entry.lower():
                entry = re.sub(r'software development', 'Software Development Program', entry, flags=re.IGNORECASE)
            if 'virtual assistance' in entry.lower() or 'aice' in entry.lower():
                entry = re.sub(r'aice', 'AI & Virtual Assistant Program', entry, flags=re.IGNORECASE)

            # Clean up spacing and punctuation
            entry = re.sub(r'\s+', ' ', entry).strip()
            entry = re.sub(r'\((\d{4})\)(\d{4})', r'(\1-\2)', entry)
            entry = re.sub(r'(\d{4})\s*(\d{4})', r'\1-\2', entry)

            lower_entry = entry.lower()
            if lower_entry not in seen_lower and len(entry) > 10:
                seen_lower.add(lower_entry)
                formatted_entries.append(entry)

        # Sort by most recent year
        def extract_year(entry):
            years = re.findall(r'20\d{2}', entry)
            return max([int(y) for y in years]) if years else 0
        formatted_entries.sort(key=extract_year, reverse=True)

        return formatted_entries if formatted_entries else []

    def _format_education_entry(self, text: str) -> str:
        """Format a single education entry with proper structure"""
        text = re.sub(r'\s+', ' ', text).strip()
        years = re.findall(r'\b20\d{2}\b', text)
        year_range = ""
        if len(years) >= 2:
            years.sort()
            year_range = f"{years[0]}-{years[1]}"
        elif len(years) == 1:
            year_range = years[0]

        institution = ""
        institution_patterns = [
            r'([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation))',
            r'(TechBridle|ALX|NWU|North West|High School|Secondary|Rondebult)'
        ]
        for pattern in institution_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                institution = match.group(1).strip()
                institution = re.sub(r'\s+', ' ', institution)
                break

        program = ""
        program_patterns = [
            r'(BSc|Bachelor|Master|PhD|Diploma|Certificate|Program|Course)',
            r'(Computer Science|Software Development|Virtual Assistance|AI|Data Science|Matric|Grade\s*12|AiCE)'
        ]
        for pattern in program_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                program = match.group(0).strip()
                if program.lower() == 'aice':
                    program = 'AI & Virtual Assistant Program'
                elif program.lower() == 'matric' or program.lower() == 'grade 12':
                    program = 'Matric'
                break

        if institution and program and year_range:
            return f"{institution}, {program} ({year_range})"
        elif institution and year_range:
            return f"{institution} ({year_range})"
        elif institution and program:
            return f"{institution} - {program}"
        elif institution:
            return institution
        elif program and year_range:
            return f"{program} ({year_range})"
        return text

    def extract_experience(self, cv_text: str) -> List[str]:
        """Extract work experience entries – always returns list."""
        experience = []
        sections = self.extract_text_sections(cv_text)
        experience_text = sections['experience'] or sections['projects']

        if experience_text:
            lines = experience_text.split('\n')
            current_entry = []

            for line in lines:
                line = line.strip()
                if line and (re.search(r'20\d{2}', line) or re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)', line.lower())):
                    if current_entry:
                        entry = ' '.join(current_entry)
                        if len(entry) > 30:
                            experience.append(entry)
                        current_entry = [line]
                    else:
                        current_entry.append(line)
                elif line and current_entry and not line.startswith(('•', '-', '*', '○', '●')):
                    current_entry.append(line)
                elif not line and current_entry:
                    entry = ' '.join(current_entry)
                    if len(entry) > 30:
                        experience.append(entry)
                    current_entry = []

            if current_entry:
                entry = ' '.join(current_entry)
                if len(entry) > 30:
                    experience.append(entry)

        cleaned = []
        for exp in experience[:3]:
            exp = re.sub(r'^[•\-*○●]\s*', '', exp)
            exp = re.sub(r'\s+', ' ', exp)
            if exp and not exp[-1] in ['.', '!', '?', ')', '"', "'"]:
                exp += '.'
            cleaned.append(exp)

        return cleaned if cleaned else []

    def extract_achievements(self, cv_text: str) -> List[str]:
        """Extract achievements – always returns list."""
        achievements = []
        lines = cv_text.split('\n')

        achievement_indicators = [
            r'\d+%', r'\d+\s*(percent|%)', r'increased', r'decreased', r'reduced',
            r'improved', r'developed', r'created', r'built', r'designed',
            r'implemented', r'launched', r'delivered', r'achieved', r'won',
            r'awarded', r'recognized', r'led', r'managed', r'coordinated',
            r'\$\s*\d+', r'R\s*\d+', r'\d+\s*(users|clients|customers|projects|sales)'
        ]

        for line in lines:
            line = line.strip()
            if line and (line.startswith(('•', '-', '*', '○', '●')) or
                        re.match(r'^(Developed|Created|Built|Designed|Implemented|Led|Managed|Achieved|Improved|Increased|Reduced|Handled|Processed|Assisted)', line, re.IGNORECASE)):
                line = re.sub(r'^[•\-*○●]\s*', '', line)
                if len(line) > 20:
                    line = re.sub(r'\s+', ' ', line)
                    if line and line[0].islower():
                        line = line[0].upper() + line[1:]
                    if line and not line[-1] in ['.', '!', '?', ')', '"', "'"]:
                        line += '.'
                    achievements.append(line)

        # Remove duplicates
        unique_achievements = []
        seen = set()
        for ach in achievements:
            if ach not in seen:
                seen.add(ach)
                unique_achievements.append(ach)

        return unique_achievements if unique_achievements else []

    def extract_links(self, cv_text: str) -> Dict[str, bool]:
        """Extract links from CV – always returns dict with defaults."""
        links = {
            'linkedin': False,
            'github': False,
            'portfolio': False
        }
        text_lower = cv_text.lower()

        linkedin_patterns = [r'linkedin\.com/in/[a-zA-Z0-9\-]+', r'linkedin\.com/', r'linkedin']
        for pattern in linkedin_patterns:
            if re.search(pattern, text_lower):
                links['linkedin'] = True
                break

        github_patterns = [r'github\.com/[a-zA-Z0-9\-]+', r'github\.com/', r'github']
        for pattern in github_patterns:
            if re.search(pattern, text_lower):
                links['github'] = True
                break

        portfolio_patterns = [r'portfolio', r'vercel\.app', r'netlify\.app', r'my website', r'personal website', r'dev\.to', r'medium\.com']
        for pattern in portfolio_patterns:
            if re.search(pattern, text_lower):
                links['portfolio'] = True
                break

        return links

    def check_spelling_errors(self, cv_text: str) -> List[str]:
        """Check for common spelling errors – returns list."""
        suggestions = []
        text_lower = cv_text.lower()
        for error, correction in self.common_misspellings.items():
            if error in text_lower:
                suggestions.append(f"Correct '{error}' to '{correction}'")
        return suggestions[:5]

    def generate_market_keywords(self, extracted_skills: List[str]) -> List[str]:
        """Generate market keywords based on skills – returns list."""
        market_keywords = set()
        for skill in extracted_skills:
            skill_lower = skill.lower()
            for key, values in self.market_keywords_map.items():
                if key in skill_lower:
                    for value in values:
                        market_keywords.add(value)
            if any(cloud in skill_lower for cloud in ['aws', 'azure', 'gcp', 'docker', 'kubernetes']):
                market_keywords.update(['CI/CD', 'DevOps', 'Cloud Architecture', 'Infrastructure as Code'])
            if any(frontend in skill_lower for frontend in ['react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css']):
                market_keywords.update(['Responsive Design', 'SPA', 'PWA', 'Web Performance', 'Cross-browser Compatibility'])
            if any(backend in skill_lower for backend in ['python', 'java', 'c#', 'node', 'php', '.net']):
                market_keywords.update(['RESTful APIs', 'Microservices', 'API Design', 'Database Optimization'])
            if any(db in skill_lower for db in ['sql', 'mysql', 'postgresql', 'mongodb']):
                market_keywords.update(['Data Modeling', 'Query Optimization', 'Database Design', 'Indexing'])
            if any(soft in skill_lower for soft in ['communication', 'problem solving', 'customer service', 'sales']):
                market_keywords.update(['Client Relations', 'Team Collaboration', 'Stakeholder Management', 'Negotiation'])
            if any(retail in skill_lower for retail in ['cash handling', 'stock management', 'inventory', 'merchandising']):
                market_keywords.update(['Inventory Control', 'POS Systems', 'Stock Replenishment', 'Loss Prevention'])
        return sorted(list(market_keywords))[:12]

    def generate_suggestions(
        self,
        extracted_skills: List[str],
        cv_text: str,
        links: Dict[str, bool],
        education: List[str],
        experience: List[str],
        achievements: List[str]
    ) -> List[str]:
        """Generate comprehensive improvement suggestions – returns list."""
        suggestions = []
        spelling_suggestions = self.check_spelling_errors(cv_text)
        suggestions.extend(spelling_suggestions[:3])

        if not education:
            suggestions.append("Add your educational background to strengthen your profile.")
        else:
            has_years = any(re.search(r'20\d{2}', edu) for edu in education)
            if not has_years:
                suggestions.append("Add graduation years to your education entries.")
            for edu in education:
                if 'ALX' in edu and 'Program' not in edu and 'Certificate' not in edu:
                    suggestions.append("Specify your ALX qualification (e.g., AI & Virtual Assistant Program).")
                    break
                if 'North West' in edu and 'BSc' not in edu and 'Computer Science' not in edu:
                    suggestions.append("Specify your NWU degree (e.g., BSc Computer Science).")
                    break

        if len(extracted_skills) < 5:
            suggestions.append("Add more specific skills to your CV. Aim for at least 8-10 relevant skills.")
        elif len(extracted_skills) < 10:
            suggestions.append("Good skill set! Consider adding more specialized skills to stand out.")
        else:
            suggestions.append("Excellent skill diversity! Now focus on demonstrating these skills with concrete examples.")

        if len(experience) == 0:
            suggestions.append("Add work experience or significant projects with clear roles and responsibilities.")
        elif len(experience) < 2:
            suggestions.append("Add more details about your responsibilities in each role.")

        if achievements:
            has_metrics = any(re.search(r'\d+%|\d+\s*(users|projects|clients|sales|percent)|[R\$]\s*\d+', ach.lower()) for ach in achievements)
            if not has_metrics:
                suggestions.append("Add metrics and numbers to your achievements to show impact (e.g., 'Increased sales by 20%').")
        else:
            suggestions.append("Highlight your key achievements with quantifiable results.")

        if not links['linkedin']:
            suggestions.append("Add your LinkedIn profile URL - 85% of recruiters check LinkedIn first.")
        if not links['github'] and any(s in extracted_skills for s in ['Python', 'JavaScript', 'Java', 'C#', 'TypeScript', 'HTML', 'CSS']):
            suggestions.append("Include your GitHub profile to showcase your code and projects.")
        if not links['portfolio'] and any(s in extracted_skills for s in ['React', 'Frontend', 'UI/UX', 'Design', 'HTML', 'CSS']):
            suggestions.append("Create and add a portfolio website to showcase your visual work.")

        unique_suggestions = []
        seen = set()
        for s in suggestions:
            if s not in seen:
                seen.add(s)
                unique_suggestions.append(s)
        return unique_suggestions[:6]

    def generate_income_ideas(self, extracted_skills: List[str]) -> List[Dict[str, str]]:
        """Generate income ideas based on skills – returns list."""
        skills_lower = [s.lower() for s in extracted_skills]
        is_tech = any(s in skills_lower for s in ['python', 'javascript', 'java', 'c#', 'c++', 'react', 'html', 'css', 'typescript', 'node.js', 'sql', 'mongodb', 'git', 'aws', 'azure', '.net', 'php', 'ruby', 'swift', 'kotlin', 'flutter'])
        is_virtual_assistant = any(s in skills_lower for s in ['virtual assistant', 'email management', 'calendar management', 'scheduling', 'meeting coordination', 'travel planning', 'administrative', 'office 365', 'microsoft office'])
        is_customer_service = any(s in skills_lower for s in ['customer service', 'communication', 'sales', 'retail', 'cash handling', 'stock management', 'client relations', 'problem solving', 'negotiation'])
        is_administrative = any(s in skills_lower for s in ['typing skills', 'data entry', 'microsoft office', 'excel', 'word', 'powerpoint', 'organization', 'time management', 'multitasking', 'filing', 'document preparation'])

        if is_tech:
            primary_skill = extracted_skills[0] if extracted_skills else 'development'
            return [
                {'title': 'Freelance Development', 'difficulty': 'MEDIUM', 'potential': 'HIGH', 'description': f'Offer your {primary_skill} development services on platforms like Upwork, Toptal, or Fiverr'},
                {'title': 'Technical Support', 'difficulty': 'LOW', 'potential': 'MEDIUM', 'description': 'Provide technical support or tutoring services to individuals or small businesses'},
                {'title': 'Remote Tech Role', 'difficulty': 'MEDIUM', 'potential': 'HIGH', 'description': 'Target international companies hiring remote tech talent'}
            ]
        elif is_virtual_assistant:
            return [
                {'title': 'Virtual Assistant Services', 'difficulty': 'LOW', 'potential': 'MEDIUM', 'description': 'Offer VA services on platforms like Belay, Time Etc, or Upwork'},
                {'title': 'Executive Support', 'difficulty': 'MEDIUM', 'potential': 'HIGH', 'description': 'Specialize in executive support with calendar and email management'},
                {'title': 'Remote Admin Assistant', 'difficulty': 'LOW', 'potential': 'MEDIUM', 'description': 'Find remote administrative assistant roles on job boards'}
            ]
        elif is_customer_service:
            return [
                {'title': 'Customer Service Representative', 'difficulty': 'LOW', 'potential': 'MEDIUM', 'description': 'Remote customer service roles in call centers or support teams'},
                {'title': 'Retail Associate', 'difficulty': 'LOW', 'potential': 'MEDIUM', 'description': 'Entry-level retail positions with growth opportunities'},
                {'title': 'Sales Representative', 'difficulty': 'MEDIUM', 'potential': 'HIGH', 'description': 'Commission-based sales roles leveraging your communication skills'}
            ]
        elif is_administrative:
            return [
                {'title': 'Data Entry Specialist', 'difficulty': 'LOW', 'potential': 'MEDIUM', 'description': 'Remote data entry positions on freelance platforms'},
                {'title': 'Administrative Assistant', 'difficulty': 'LOW', 'potential': 'MEDIUM', 'description': 'Office admin or remote administrative support roles'},
                {'title': 'Office Coordinator', 'difficulty': 'MEDIUM', 'potential': 'MEDIUM', 'description': 'Coordinate office operations and administrative tasks'}
            ]
        else:
            return [
                {'title': 'Entry-Level Opportunities', 'difficulty': 'LOW', 'potential': 'MEDIUM', 'description': 'Explore entry-level roles matching your skills and interests'},
                {'title': 'Skill Development', 'difficulty': 'LOW', 'potential': 'HIGH', 'description': 'Take online courses to build in-demand skills for better opportunities'},
                {'title': 'Apprenticeship Program', 'difficulty': 'MEDIUM', 'potential': 'HIGH', 'description': 'Apply for learnerships or apprenticeship programs in your field'}
            ]

    # ----------------------------------------------------------------------
    # Main analysis method – async
    # ----------------------------------------------------------------------
    async def analyze_cv(self, cv_text: str, job_requirements: Optional[List[str]] = None) -> Dict[str, Any]:
        """Complete CV analysis – tries AI first, falls back to rules."""
        if not cv_text or not cv_text.strip():
            return {
                'extractedSkills': [],
                'missingSkills': [],
                'marketKeywords': [],
                'suggestions': ['Please provide CV text for analysis'],
                'about': '',
                'education': [],
                'experience': [],
                'achievements': [],
                'cvText': '',
                'links': {'linkedin': False, 'github': False, 'portfolio': False}
            }

        # Try AI extraction (async)
        ai_result = await self._analyze_with_ai(cv_text)

        if ai_result:
            about = ai_result.get('about', '')
            extracted_skills = ai_result.get('skills', [])
            education = ai_result.get('education', [])
            experience = ai_result.get('experience', [])
            achievements = ai_result.get('achievements', [])
            links = ai_result.get('links', {'linkedin': False, 'github': False, 'portfolio': False})
            print("AI‑based extraction successful.")
        else:
            print("AI extraction failed or disabled – using rule‑based fallback.")
            about = self.extract_about_section(cv_text) or ""
            education = self.extract_education(cv_text) or []
            experience = self.extract_experience(cv_text) or []
            achievements = self.extract_achievements(cv_text) or []
            extracted_skills = self.extract_skills(cv_text) or []
            links = self.extract_links(cv_text) or {'linkedin': False, 'github': False, 'portfolio': False}

        missing_skills = []
        if job_requirements:
            missing_skills = self.identify_missing_skills(extracted_skills, job_requirements)

        market_keywords = self.generate_market_keywords(extracted_skills)
        suggestions = self.generate_suggestions(extracted_skills, cv_text, links, education, experience, achievements)
        income_ideas = self.generate_income_ideas(extracted_skills)

        if not about or len(about) < 30:
            if extracted_skills:
                about = f"Professional with expertise in {', '.join(extracted_skills[:6])}."
            else:
                about = "Professional seeking new opportunities."

        print(f"CV Analysis Results:")
        print(f"  - About: {about[:80] if about else 'Not found'}...")
        print(f"  - Education: {education}")
        print(f"  - Skills: {len(extracted_skills)}")
        print(f"  - Experience: {len(experience)}")
        print(f"  - Achievements: {len(achievements)}")
        print(f"  - Income Ideas: {len(income_ideas)}")

        return {
            'extractedSkills': extracted_skills,
            'missingSkills': missing_skills,
            'marketKeywords': market_keywords,
            'suggestions': suggestions,
            'about': about,
            'education': education,
            'experience': experience,
            'achievements': achievements,
            'cvText': cv_text[:2000],
            'links': links,
            'incomeIdeas': income_ideas
        }

    def identify_missing_skills(
        self,
        extracted_skills: List[str],
        job_requirements: List[str]
    ) -> List[str]:
        """Identify missing skills compared to job requirements – returns list."""
        if not job_requirements:
            return []
        missing = []
        extracted_lower = [s.lower() for s in extracted_skills]
        for req in job_requirements:
            req_lower = req.lower()
            found = False
            for skill in extracted_lower:
                if req_lower in skill or skill in req_lower:
                    found = True
                    break
            if not found:
                missing.append(req)
        return missing