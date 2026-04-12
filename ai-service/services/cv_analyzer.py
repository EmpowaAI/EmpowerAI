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
import hashlib
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openai import RateLimitError
from utils.ai_client import AIClient
from utils.logger import get_logger

class CVAnalyzer:
    """Analyzes CVs and extracts information - Ensures consistent results for same CV"""

    # In-memory cache for analysis results to ensure consistency
    _analysis_cache: Dict[str, Dict[str, Any]] = {}

    # Tech-specific keywords that should NEVER appear in non-tech weaknesses
    TECH_KEYWORDS = [
        'agile', 'scrum', 'devops', 'containerization', 'docker', 'kubernetes',
        'ci/cd', 'git', 'github', 'pipeline', 'microservices', 'api', 'rest',
        'frontend', 'backend', 'fullstack', 'react', 'angular', 'vue', 'node.js',
        'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'cloud', 'aws',
        'azure', 'gcp', 'unit test', 'integration test', 'code review'
    ]

    def __init__(self, ai_client: Optional[AIClient] = None):
        self.ai_client = ai_client or AIClient()
        self.logger = get_logger()
        
        # Industry detection keywords
        self.industry_keywords = {
            'retail': [
                'spar', 'pick n pay', 'checkers', 'woolworths', 'shoprite', 'game', 'makro',
                'cashier', 'till', 'pos', 'point of sale', 'stock management', 'merchandising',
                'inventory', 'shelf', 'customer service', 'retail', 'store', 'supermarket',
                'cash handling', 'restocking', 'floor assistant', 'sales assistant',
                'customer', 'shop', 'shelves', 'display', 'stock take', 'pricing'
            ],
            'technology': [
                'python', 'javascript', 'react', 'node', 'java', 'c++', 'c#', 'developer',
                'software', 'engineer', 'devops', 'agile', 'scrum', 'git', 'docker', 'kubernetes',
                'api', 'frontend', 'backend', 'fullstack', 'cloud', 'aws', 'azure'
            ],
            'healthcare': [
                'nurse', 'doctor', 'clinical', 'patient', 'hospital', 'clinic', 'medical',
                'healthcare', 'caregiver', 'pharmacy', 'therapist', 'radiology', 'laboratory',
                'lab tech', 'phlebotomy', 'mbchb', 'nursing'
            ],
            'hospitality': [
                'hotel', 'restaurant', 'chef', 'waiter', 'bartender', 'hospitality', 'food',
                'beverage', 'catering', 'guest', 'front desk', 'reception', 'lodge', 'resort',
                'housekeeping', 'banquet'
            ],
            'finance': [
                'accountant', 'bookkeeper', 'finance', 'audit', 'tax', 'payroll', 'sage',
                'pastel', 'quickbooks', 'financial', 'budget', 'forecasting', 'reconciliation',
                'creditors', 'debtors', 'invoice', 'sap'
            ],
            'administration': [
                'administrative', 'admin', 'secretary', 'receptionist', 'office', 'data entry',
                'filing', 'scheduling', 'calendar', 'correspondence', 'clerical', 'assistant',
                'personal assistant', 'executive assistant'
            ],
            'education': [
                'teacher', 'lecturer', 'educator', 'school', 'university', 'college', 'tutor',
                'curriculum', 'lesson', 'student', 'academic', 'professor', 'instructor'
            ],
            'construction': [
                'construction', 'building', 'civil', 'site', 'foreman', 'engineer', 'architect',
                'quantity surveyor', 'project manager', 'contractor', 'bricklayer', 'carpenter',
                'electrician', 'plumber', 'welder'
            ],
            'manufacturing': [
                'manufacturing', 'production', 'factory', 'assembly', 'quality control', 'qc',
                'operator', 'machine', 'plant', 'warehouse', 'logistics', 'supply chain',
                'fabrication', 'process'
            ],
            'sales': [
                'sales', 'business development', 'account manager', 'client relationship',
                'lead generation', 'cold calling', 'b2b', 'b2c', 'sales representative',
                'sales consultant', 'territory manager'
            ]
        }
        
        # Industry-specific weakness templates - CRITICAL for fallback
        self.industry_weaknesses = {
            'retail': [
                "No specific POS/till systems mentioned - list the systems you've used (e.g., SAP, GAAP, or specific POS)",
                "Limited measurable achievements - add numbers like 'Served 100+ customers daily' or 'Handled R50,000+ in daily transactions'",
                "No driver's licence indicated - many retail roles require reliable transport",
                "Matric subjects not listed - specify subjects passed (especially Mathematics, Accounting, or Business Studies)",
                "No references or character references - retail employers often value references from previous supervisors",
                "Missing specific retail terminology - add keywords like 'Merchandising', 'Stock Control', 'Inventory Management'",
                "No mention of shift flexibility or weekend availability - important for retail roles",
                "Limited work experience duration - add more detail about responsibilities and daily tasks"
            ],
            'technology': [
                "Missing Agile/Scrum methodology experience - valuable for team environments",
                "No version control (Git) mentioned - essential for collaborative development",
                "Few quantifiable achievements - add metrics like performance improvements or user metrics",
                "Missing cloud platform experience (AWS/Azure/GCP) - increasingly important",
                "No CI/CD or DevOps practices mentioned",
                "Lack of testing practices (unit tests, integration tests)",
                "Missing portfolio or GitHub link - important for showcasing work"
            ],
            'healthcare': [
                "No HPCSA/SANC registration number listed if applicable",
                "Missing specific clinical skills or procedures performed",
                "No mention of patient care metrics or caseload numbers",
                "Limited continuing education or CPD points mentioned",
                "Missing specialization or area of interest"
            ],
            'hospitality': [
                "No mention of specific POS or reservation systems used",
                "Missing language skills - valuable in hospitality",
                "No food safety or hygiene certifications mentioned",
                "Limited customer service achievements or recognition",
                "Missing shift flexibility or availability information"
            ],
            'finance': [
                "No specific accounting software mentioned (Sage, Pastel, SAP, QuickBooks)",
                "Missing tax knowledge or SARS compliance experience",
                "No mention of financial reporting or analysis skills",
                "Limited experience with audits or reconciliations",
                "No professional body registration (SAICA, SAIPA, CIMA)"
            ],
            'administration': [
                "No specific office software proficiency listed beyond basics",
                "Missing typing speed or accuracy metrics",
                "No mention of diary management or scheduling tools",
                "Limited experience with filing systems or document management",
                "No mention of handling confidential information"
            ],
            'education': [
                "No SACE registration number listed if applicable",
                "Missing specific subjects or grades taught",
                "No mention of curriculum development or lesson planning",
                "Limited experience with assessment and evaluation",
                "Missing continuing professional development (CPD) activities"
            ],
            'construction': [
                "No mention of specific tools, equipment, or machinery experience",
                "Missing health and safety certifications (SACPCMP, etc.)",
                "No project scale or budget details",
                "Limited site management or supervision experience mentioned",
                "Missing professional body registration (ECSA, SACPCMP)"
            ],
            'manufacturing': [
                "No specific machinery or equipment experience listed",
                "Missing quality control or inspection experience",
                "No mention of safety protocols or OHS training",
                "Limited production efficiency or output metrics",
                "No experience with lean manufacturing or continuous improvement"
            ],
            'sales': [
                "No specific sales targets or quota achievements mentioned",
                "Missing CRM software experience",
                "No mention of closing rates or conversion metrics",
                "Limited territory management or account planning details",
                "Missing negotiation skills examples"
            ]
        }
        
        # Industry-specific recommendation templates
        self.industry_recommendations = {
            'retail': [
                "Add measurable achievements such as sales targets met or customer satisfaction scores",
                "Include retail-specific keywords like 'point of sale', 'inventory control', 'merchandising', and 'loss prevention'",
                "List any retail systems or POS software used",
                "Add a LinkedIn profile link for professional presence",
                "Format CV with clear headings and bullet points for ATS readability",
                "Highlight shift flexibility, weekend availability, and ability to work under pressure",
                "Include any training, certificates, or workshops related to retail or customer service",
                "Add driver's licence information (e.g., Code 8) if applicable"
            ],
            'technology': [
                "Add links to GitHub, portfolio, or LinkedIn to showcase work",
                "Include specific technologies and frameworks with version numbers",
                "Add quantifiable achievements with metrics (e.g., 'Improved performance by 30%')",
                "Mention Agile/Scrum methodology experience if applicable",
                "List any cloud certifications or DevOps experience",
                "Include testing frameworks and CI/CD experience"
            ],
            'healthcare': [
                "Add HPCSA/SANC registration number and professional body details",
                "List specific clinical procedures and competencies",
                "Include continuing education and CPD points",
                "Add language proficiency (especially for patient communication)",
                "Mention any specialized training or certifications"
            ],
            'hospitality': [
                "Add language skills (English, Afrikaans, isiZulu, etc.)",
                "Include food safety and hygiene certifications",
                "List specific POS and reservation systems used",
                "Add upselling achievements and revenue metrics",
                "Mention availability for shifts and weekends"
            ],
            'finance': [
                "Add specific accounting software proficiency (Sage, Pastel, SAP, etc.)",
                "Include professional body registration (SAICA, SAIPA, CIMA)",
                "List tax and SARS compliance experience",
                "Add financial reporting and analysis examples",
                "Mention audit experience if applicable"
            ],
            'administration': [
                "Add specific Office 365/Google Workspace proficiency",
                "Include typing speed and accuracy metrics",
                "List scheduling and diary management tools used",
                "Add examples of handling confidential information",
                "Mention multitasking and prioritization skills"
            ],
            'education': [
                "Add SACE registration number",
                "List specific subjects and grades taught",
                "Include curriculum development experience",
                "Add assessment and evaluation examples",
                "Mention extracurricular involvement"
            ],
            'construction': [
                "Add health and safety certifications",
                "List specific software proficiency (AutoCAD, Revit, MS Project)",
                "Include project scale and budget details",
                "Add professional body registration (ECSA, SACPCMP)",
                "Mention specific tools and equipment experience"
            ],
            'manufacturing': [
                "Add OHS and safety certifications",
                "List specific machinery and equipment experience",
                "Include quality control and inspection experience",
                "Add production efficiency metrics",
                "Mention lean manufacturing experience"
            ],
            'sales': [
                "Add specific sales targets and achievements with numbers",
                "List CRM software experience (Salesforce, HubSpot, etc.)",
                "Include closing rates and conversion metrics",
                "Add territory management and account planning details",
                "Mention pipeline management experience"
            ]
        }
        
        # Industry-specific missing keywords
        self.industry_missing_keywords = {
            'retail': [
                'POS System', 'Till Operation', 'Cash Handling', 'Stock Management',
                'Merchandising', 'Customer Service Excellence', 'Shelf Restocking',
                'Inventory Control', 'Point of Sale', 'Retail Operations',
                'Stock Taking', 'Loss Prevention', 'Customer Engagement', 'Store Standards'
            ],
            'technology': [
                'Agile', 'Scrum', 'Git', 'CI/CD', 'REST APIs', 'Cloud Computing',
                'Microservices', 'Unit Testing', 'Code Review', 'DevOps'
            ],
            'healthcare': [
                'Patient Care', 'Clinical Assessment', 'Vital Signs', 'Medical Records',
                'Infection Control', 'Medication Administration', 'HPCSA Registered'
            ],
            'hospitality': [
                'Food Safety', 'Customer Service', 'POS Systems', 'Table Service',
                'Mixology', 'Event Coordination', 'Hospitality Management'
            ],
            'finance': [
                'Financial Reporting', 'Tax Compliance', 'Audit', 'Reconciliation',
                'Budgeting', 'Forecasting', 'Sage Pastel', 'SAP FICO'
            ],
            'administration': [
                'Office Management', 'Scheduling', 'Data Entry', 'Document Management',
                'Correspondence', 'Calendar Management', 'MS Office Suite'
            ],
            'education': [
                'Curriculum Development', 'Lesson Planning', 'Assessment', 'SACE Registered',
                'Classroom Management', 'Student Engagement', 'Parent Communication'
            ],
            'construction': [
                'Site Management', 'Health & Safety', 'Project Planning', 'AutoCAD',
                'Quantity Surveying', 'Building Regulations', 'Contract Management'
            ],
            'manufacturing': [
                'Quality Control', 'Production Planning', 'Lean Manufacturing',
                'Six Sigma', 'OHS Compliance', 'Machine Operation', 'Supply Chain'
            ],
            'sales': [
                'Lead Generation', 'Pipeline Management', 'CRM', 'Closing Deals',
                'Account Management', 'Negotiation', 'Revenue Growth'
            ]
        }

        # Read-only fallback data structures
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
            'grade 12', 'matric', 'high school', 'sage', 'pastel', 'sap',
            'drivers licence', 'code 8', 'code 10', 'bbbeee', 'bee', 'pos',
            'till', 'retail', 'spar', 'shoprite', 'checkers', 'woolworths'
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
            'retail': ['Inventory Management', 'Merchandising', 'Point of Sale', 'Stock Control'],
            'sage': ['Sage Pastel', 'Sage Evolution', 'Sage One', 'Sage 300'],
            'pastel': ['Pastel Partner', 'Pastel Xpress', 'Pastel Payroll'],
            'sap': ['SAP FICO', 'SAP HCM', 'SAP MM', 'SAP SD', 'SAP Basis'],
            'pos': ['Point of Sale Systems', 'Till Operation', 'Cash Register', 'Payment Processing'],
            'stock management': ['Inventory Control', 'Stock Replenishment', 'Stock Taking', 'Warehouse Management']
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
            'kubenetes': 'Kubernetes',
            'drivers': "driver's",
            'licence': 'license',
            'matriculant': 'matric',
            'grand 12': 'grade 12',
            'nqf': 'NQF level',
            'bbbeee': 'B-BBEE',
            'bee': 'B-BBEE'
        }

    # ----------------------------------------------------------------------
    # Helper to clean AI weaknesses
    # ----------------------------------------------------------------------
    def _clean_weaknesses(self, weaknesses: List[str], industry: str) -> List[str]:
        """Remove tech-specific weaknesses for non-tech industries and ensure industry-appropriate content."""
        if not weaknesses:
            return self.industry_weaknesses.get(industry, ["No specific weaknesses identified"])[:6]
        
        cleaned = []
        for w in weaknesses:
            w_lower = w.lower()
            # Skip if it contains tech keywords but industry is not tech
            if industry != 'technology':
                contains_tech = any(tech in w_lower for tech in self.TECH_KEYWORDS)
                if contains_tech:
                    self.logger.info(f"Skipping tech-specific weakness for {industry}: {w}")
                    continue
            cleaned.append(w)
        
        # If after cleaning we have fewer than 2 weaknesses, add industry defaults
        if len(cleaned) < 2:
            defaults = self.industry_weaknesses.get(industry, ["Few quantifiable achievements - add metrics and numbers to demonstrate impact"])
            cleaned.extend(defaults[:3])
        
        # Ensure we don't have duplicates
        seen = set()
        unique = []
        for w in cleaned:
            if w not in seen:
                seen.add(w)
                unique.append(w)
        
        return unique[:6]

    # ----------------------------------------------------------------------
    # Industry Detection
    # ----------------------------------------------------------------------
    def detect_industry(self, cv_text: str, extracted_skills: List[str] = None, experience: List[str] = None) -> str:
        """Detect the candidate's industry from CV text, skills, and experience."""
        text_lower = cv_text.lower()
        
        # Combine all text for detection
        combined_text = text_lower
        if extracted_skills:
            combined_text += " " + " ".join([s.lower() for s in extracted_skills])
        if experience:
            combined_text += " " + " ".join([e.lower() for e in experience])
        
        # Count matches for each industry
        industry_scores = {}
        for industry, keywords in self.industry_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in combined_text:
                    score += 1
            if score > 0:
                industry_scores[industry] = score
        
        # Get the industry with highest score
        if industry_scores:
            detected_industry = max(industry_scores, key=industry_scores.get)
            self.logger.info(f"Detected industry: {detected_industry} (score: {industry_scores[detected_industry]})")
            return detected_industry
        
        # Default to general if no specific industry detected
        self.logger.info("No specific industry detected, using general recommendations")
        return 'general'
    
    def get_industry_specific_weaknesses(self, industry: str, extracted_skills: List[str], 
                                          experience: List[str], achievements: List[str]) -> List[str]:
        """Get industry-specific weaknesses based on detected industry."""
        if industry not in self.industry_weaknesses:
            return self._get_general_weaknesses(extracted_skills, experience, achievements)
        
        weaknesses = list(self.industry_weaknesses[industry])
        
        # Add industry-agnostic weaknesses based on actual content
        if not achievements or len(achievements) == 0:
            weaknesses.append("No achievements listed - add quantifiable accomplishments to demonstrate impact")
        elif not any(re.search(r'\d+%|\d+\s*(customers|sales|units|items)|[R\$]\s*\d+', str(ach).lower()) for ach in achievements):
            weaknesses.append("Achievements lack metrics - add numbers to show impact (e.g., 'Increased sales by 20%', 'Served 100+ customers daily')")
        
        if not experience or len(experience) < 2:
            weaknesses.append("Limited work experience - consider adding volunteer work, internships, or part-time roles")
        
        if len(extracted_skills) < 5:
            weaknesses.append("Limited skills listed - add more relevant skills for your industry")
        
        # Limit to 6 weaknesses
        return weaknesses[:6]
    
    def _get_general_weaknesses(self, extracted_skills: List[str], experience: List[str], 
                                 achievements: List[str]) -> List[str]:
        """Get general weaknesses when industry can't be detected."""
        weaknesses = []
        
        if not experience or len(experience) == 0:
            weaknesses.append("No work experience listed - add employment history, internships, or volunteer work")
        
        if len(extracted_skills) < 5:
            weaknesses.append("Limited skills listed - add more relevant skills to strengthen your profile")
        
        if not achievements or len(achievements) == 0:
            weaknesses.append("No achievements listed - add quantifiable accomplishments to demonstrate impact")
        
        if not any('linkedin' in skill.lower() for skill in extracted_skills) and not any('linkedin' in str(exp).lower() for exp in experience):
            weaknesses.append("No LinkedIn profile mentioned - create one for professional visibility")
        
        return weaknesses[:6]
    
    def get_industry_specific_recommendations(self, industry: str, extracted_skills: List[str],
                                               links: Dict[str, bool], education: List[str]) -> List[str]:
        """Get industry-specific recommendations based on detected industry."""
        if industry not in self.industry_recommendations:
            return self._get_general_recommendations(extracted_skills, links, education)
        
        recommendations = list(self.industry_recommendations[industry])
        
        # Add industry-agnostic recommendations based on actual content
        if not links.get('linkedin', False):
            recommendations.append("Create and link a LinkedIn profile for professional visibility")
        
        if not education or len(education) == 0:
            recommendations.append("Add educational background including Matric/Grade 12 details")
        elif not any('matric' in edu.lower() or 'grade 12' in edu.lower() for edu in education):
            recommendations.append("Add Matric/Grade 12 details with subjects - important for South African employers")
        
        # Limit to 8 recommendations
        return recommendations[:8]
    
    def _get_general_recommendations(self, extracted_skills: List[str], links: Dict[str, bool], 
                                      education: List[str]) -> List[str]:
        """Get general recommendations when industry can't be detected."""
        recommendations = []
        
        if not links.get('linkedin', False):
            recommendations.append("Create and link a LinkedIn profile for professional visibility")
        
        if not education or len(education) == 0:
            recommendations.append("Add educational background including qualifications and institutions")
        
        if len(extracted_skills) < 8:
            recommendations.append("Expand your skills section with more relevant skills")
        
        recommendations.append("Add measurable achievements with numbers and metrics to demonstrate impact")
        recommendations.append("Improve formatting with clear headings and bullet points for better readability")
        
        return recommendations[:6]
    
    def get_industry_specific_missing_keywords(self, industry: str) -> List[str]:
        """Get industry-specific missing keywords for ATS optimization."""
        if industry not in self.industry_missing_keywords:
            return [
                'Communication', 'Teamwork', 'Problem Solving', 'Time Management',
                'Attention to Detail', 'Reliability', 'Adaptability'
            ]
        return self.industry_missing_keywords[industry]

    # ----------------------------------------------------------------------
    # AI-powered extraction (primary method) – async
    # ----------------------------------------------------------------------
    async def _analyze_with_ai(self, cv_text: str) -> Optional[Dict[str, Any]]:
        """Use Azure OpenAI to extract structured information from the CV."""
        if not self.ai_client.enabled:
            self.logger.warning("AI client disabled - will use rule-based fallback")
            return None

        system_prompt = """You are an expert South African career consultant and CV analyst specializing in ATS (Applicant Tracking System) optimization. You analyze CVs across ALL industries.

CRITICAL INSTRUCTION: FIRST detect the candidate's industry from their work experience. If they have retail experience (Spar, cashier, stock management), they are in RETAIL - NOT TECHNOLOGY.

DO NOT suggest tech skills (Agile, Scrum, DevOps, Docker, Kubernetes, Git, CI/CD) for non-tech candidates.

Analyze the CV text and return a JSON response. Be honest about what's actually in the CV.

Return a JSON object with these exact keys:

{
  "score": number (0-100),
  "readinessLevel": string (EXCEPTIONAL, HIGH POTENTIAL, INTERMEDIATE, DEVELOPING, JUNIOR),
  "industry": string (retail, technology, healthcare, hospitality, finance, administration, education, construction, manufacturing, sales, or general),
  "summary": string (2-3 sentence summary based on ACTUAL industry),
  "strengths": array of strings (3-6 strengths based on ACTUAL CV content),
  "weaknesses": array of strings (3-8 weaknesses - MUST match the detected industry, NO tech terms for retail candidates),
  "sections": {
    "about": string,
    "skills": array of strings,
    "education": array of strings,
    "experience": array of strings,
    "achievements": array of strings
  },
  "linkCheck": {
    "linkedin": boolean,
    "github": boolean,
    "portfolio": boolean,
    "driversLicence": boolean
  },
  "recommendations": array of strings (industry-appropriate),
  "missingKeywords": array of strings (industry-appropriate),
  "incomeIdeas": array of objects with title, difficulty, potential, description
}

For RETAIL candidates, weaknesses should be like:
- No specific POS/till systems mentioned
- Limited measurable achievements
- No driver's licence indicated
- Matric subjects not listed
- Missing specific retail terminology

NEVER suggest Agile, Scrum, DevOps, or containerization for retail candidates."""

        max_cv_length = 8000
        truncated_cv = cv_text[:max_cv_length] if len(cv_text) > max_cv_length else cv_text
        
        prompt = f"""Analyze this CV. First, identify the industry from the work experience.

CV TEXT:
{truncated_cv}

Return a JSON object with the exact structure specified."""

        try:
            self.logger.info("Attempting AI-powered CV analysis with industry detection...")
            
            result = await self.ai_client.generate_structured_response_async(
                prompt=prompt,
                system_prompt=system_prompt,
                response_schema={},
                temperature=0.2,
                max_tokens=3000,
                retry_on_fail=True
            )
            
            if result and isinstance(result, dict):
                expected_keys = ['score', 'readinessLevel', 'industry', 'summary', 'strengths', 'weaknesses', 
                               'sections', 'linkCheck', 'recommendations', 'missingKeywords', 'incomeIdeas']
                
                missing_keys = [key for key in expected_keys if key not in result]
                
                if missing_keys:
                    self.logger.warning(f"AI response missing keys: {missing_keys}")
                    return None
                
                sections = result.get('sections', {})
                required_sections = ['about', 'skills', 'education', 'experience', 'achievements']
                for section in required_sections:
                    if section not in sections:
                        sections[section] = [] if section != 'about' else ''
                
                link_check = result.get('linkCheck', {})
                for link in ['linkedin', 'github', 'portfolio', 'driversLicence']:
                    if link not in link_check:
                        link_check[link] = False
                
                result['linkCheck'] = link_check
                
                # CRITICAL: Clean weaknesses based on detected industry
                detected_industry = result.get('industry', 'general')
                result['weaknesses'] = self._clean_weaknesses(result.get('weaknesses', []), detected_industry)
                
                self.logger.info(f"✅ AI analysis successful! Industry: {detected_industry}")
                self.logger.info(f"   Weaknesses after cleaning: {result['weaknesses']}")
                
                return result
            else:
                self.logger.warning("AI returned invalid result format")
                return None
                
        except Exception as e:
            self.logger.error(f"❌ AI analysis failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return None

    # ----------------------------------------------------------------------
    # Rule-based extraction methods (fallback)
    # ----------------------------------------------------------------------
    def _extract_email(self, text: str) -> Optional[str]:
        email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
        match = re.search(email_pattern, text)
        return match.group(0) if match else None

    def _extract_phone(self, text: str) -> Optional[str]:
        patterns = [
            r'(?:\+27|0)[\s-]?[1-9][0-9]{8}',
            r'0[0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{4}',
            r'\(?0[0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return None

    def _extract_location(self, text: str) -> Optional[str]:
        cities = [
            'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
            'Bloemfontein', 'East London', 'Pietermaritzburg', 'Polokwane',
            'Nelspruit', 'Rustenburg', 'Kimberley', 'Upington', 'George'
        ]
        
        text_lower = text.lower()
        for city in cities:
            if city.lower() in text_lower:
                return city
        return None

    def _extract_name(self, text: str) -> Optional[str]:
        lines = text.split('\n')
        for line in lines[:5]:
            line = line.strip()
            if line and len(line.split()) in [2, 3]:
                words = line.split()
                if all(word[0].isupper() if word else False for word in words):
                    if not any(word.lower() in ['cv', 'curriculum', 'vitae', 'resume'] for word in words):
                        return line
        return None

    def extract_text_sections(self, cv_text: str) -> Dict[str, str]:
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
        if not cv_text or not cv_text.strip():
            return []

        found_skills = set()
        cv_lower = cv_text.lower()

        for skill in self.skill_keywords:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, cv_lower):
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
                elif skill == 'drivers licence':
                    found_skills.add("Driver's Licence")
                elif skill == 'bbbeee' or skill == 'bee':
                    found_skills.add("B-BBEE")
                elif skill == 'sage':
                    found_skills.add("Sage")
                elif skill == 'pastel':
                    found_skills.add("Pastel")
                elif skill == 'sap':
                    found_skills.add("SAP")
                elif skill == 'pos':
                    found_skills.add("POS Systems")
                elif skill == 'till':
                    found_skills.add("Till Operation")
                else:
                    words = skill.split()
                    capitalized = ' '.join(w.capitalize() for w in words)
                    found_skills.add(capitalized)

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
            ('positive attitude', 'Positive Attitude'),
            ('grade 12', 'Matric'),
            ('high school', 'Matric'),
            ('drivers licence', "Driver's Licence"),
            ('code 8', 'Driver\'s Licence Code 8'),
            ('code 10', 'Driver\'s Licence Code 10'),
            ('point of sale', 'POS Systems'),
            ('till operation', 'Till Operation'),
            ('inventory control', 'Inventory Control'),
            ('merchandising', 'Merchandising')
        ]

        for skill_text, display_name in compound_skills:
            if skill_text in cv_lower:
                found_skills.add(display_name)

        return sorted(list(found_skills)) if found_skills else []

    def extract_about_section(self, cv_text: str) -> str:
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
                                     ['retail', 'customer service', 'sales', 'assistant', 'cashier',
                                      'developer', 'engineer', 'professional', 'experienced',
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
        if not cv_text:
            return []

        education_entries = []
        seen_entries = set()
        lines = cv_text.split('\n')
        in_education = False
        edu_lines = []

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

        if not education_entries:
            pattern1 = r'([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation|Secondary))[,\s]+([A-Za-z\s]+(?:Development|Science|Engineering|Technology|Program|Certificate|Course|Diploma|Degree)?)[,\s]*\(?(\d{4})\s*[-–]\s*(\d{4}|present|current)\)?'
            matches = re.findall(pattern1, cv_text, re.IGNORECASE)
            for match in matches:
                entry = f"{match[0]}, {match[1]} ({match[2]}-{match[3]})"
                education_entries.append(entry)

            pattern2 = r'(\d{4})\s*[-–]\s*(\d{4}|present|current)\s*[|,]\s*([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation))[,\s]+([A-Za-z\s]+)'
            matches = re.findall(pattern2, cv_text, re.IGNORECASE)
            for match in matches:
                entry = f"{match[2]}, {match[3]} ({match[0]}-{match[1]})"
                education_entries.append(entry)

            pattern3 = r'([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation))\s*[-–]\s*([A-Za-z\s]+(?:Development|Science|Engineering|Technology)?)[,\s]*\(?(\d{4})\)?'
            matches = re.findall(pattern3, cv_text, re.IGNORECASE)
            for match in matches:
                entry = f"{match[0]}, {match[1]} ({match[2]})"
                education_entries.append(entry)

        formatted_entries = []
        seen_lower = set()
        for entry in education_entries:
            entry = re.sub(r'\s+', ' ', entry).strip()
            lower_entry = entry.lower()
            if lower_entry not in seen_lower and len(entry) > 10:
                seen_lower.add(lower_entry)
                formatted_entries.append(entry)

        def extract_year(entry):
            years = re.findall(r'20\d{2}', entry)
            return max([int(y) for y in years]) if years else 0
        formatted_entries.sort(key=extract_year, reverse=True)

        return formatted_entries if formatted_entries else []

    def _format_education_entry(self, text: str) -> str:
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
            r'([A-Za-z\s]+(?:University|College|Institute|Academy|School|Foundation|Secondary))',
        ]
        for pattern in institution_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                institution = match.group(1).strip()
                institution = re.sub(r'\s+', ' ', institution)
                break

        program = ""
        program_patterns = [
            r'(BSc|Bachelor|Master|PhD|Diploma|Certificate|Program|Course|Matric|Grade\s*12|NQF\s*Level\s*\d+)',
            r'(Computer Science|Software Development|Virtual Assistance|AI|Data Science|Retail Management|Business Studies)'
        ]
        for pattern in program_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                program = match.group(0).strip()
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
        achievements = []
        lines = cv_text.split('\n')

        for line in lines:
            line = line.strip()
            if line and (line.startswith(('•', '-', '*', '○', '●')) or
                        re.match(r'^(Developed|Created|Built|Designed|Implemented|Led|Managed|Achieved|Improved|Increased|Reduced|Handled|Processed|Assisted|Served|Operated|Maintained|Restocked|Organized|Coordinated)', line, re.IGNORECASE)):
                line = re.sub(r'^[•\-*○●]\s*', '', line)
                if len(line) > 20:
                    line = re.sub(r'\s+', ' ', line)
                    if line and line[0].islower():
                        line = line[0].upper() + line[1:]
                    if line and not line[-1] in ['.', '!', '?', ')', '"', "'"]:
                        line += '.'
                    achievements.append(line)

        unique_achievements = []
        seen = set()
        for ach in achievements:
            if ach not in seen:
                seen.add(ach)
                unique_achievements.append(ach)

        return unique_achievements if unique_achievements else []

    def extract_links(self, cv_text: str) -> Dict[str, bool]:
        links = {
            'linkedin': False,
            'github': False,
            'portfolio': False,
            'driversLicence': False
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
        
        drivers_patterns = [r'code\s*[8|10]', r'driver.?s\s*licence', r'drivers\s*license', r'valid\s*driver']
        for pattern in drivers_patterns:
            if re.search(pattern, text_lower):
                links['driversLicence'] = True
                break

        return links

    def check_spelling_errors(self, cv_text: str) -> List[str]:
        suggestions = []
        text_lower = cv_text.lower()
        for error, correction in self.common_misspellings.items():
            if error in text_lower:
                suggestions.append(f"Correct '{error}' to '{correction}'")
        return suggestions[:5]

    def generate_market_keywords(self, extracted_skills: List[str]) -> List[str]:
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
            if any(retail in skill_lower for retail in ['cash handling', 'stock management', 'inventory', 'merchandising', 'pos', 'till']):
                market_keywords.update(['Inventory Control', 'POS Systems', 'Stock Replenishment', 'Loss Prevention', 'Customer Service Excellence'])
            if 'sage' in skill_lower or 'pastel' in skill_lower:
                market_keywords.update(['Sage Pastel Accounting', 'Financial Software', 'Bookkeeping'])
            if 'sap' in skill_lower:
                market_keywords.update(['SAP ERP', 'Enterprise Resource Planning', 'SAP Modules'])
            if 'drivers' in skill_lower or 'licence' in skill_lower:
                market_keywords.update(["Driver's Licence Code 8", 'Valid Driver\'s Licence'])
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
        # Detect industry first
        industry = self.detect_industry(cv_text, extracted_skills, experience)
        
        # Get industry-specific recommendations
        suggestions = self.get_industry_specific_recommendations(
            industry, extracted_skills, links, education
        )
        
        # Add spelling suggestions
        spelling_suggestions = self.check_spelling_errors(cv_text)
        suggestions.extend(spelling_suggestions[:2])
        
        # Add industry-agnostic suggestions based on actual content
        if not achievements or len(achievements) == 0:
            suggestions.append("Highlight your key achievements with quantifiable results - employers value measurable impact")
        elif not any(re.search(r'\d+%|\d+\s*(customers|sales|units|items)|[R\$]\s*\d+', str(ach).lower()) for ach in achievements):
            suggestions.append("Add metrics and numbers to your achievements to show impact (e.g., 'Increased sales by 20%', 'Served 100+ customers daily')")
        
        if not experience or len(experience) < 2:
            suggestions.append("Add more detail about your responsibilities in each role - use action verbs and quantify achievements where possible")
        
        if len(extracted_skills) < 5:
            suggestions.append("Expand your skills section with more relevant skills for your industry")
        
        # Remove duplicates while preserving order
        unique_suggestions = []
        seen = set()
        for s in suggestions:
            if s not in seen:
                seen.add(s)
                unique_suggestions.append(s)
        
        return unique_suggestions[:8]

    def generate_income_ideas(self, extracted_skills: List[str], industry: str = None) -> List[Dict[str, str]]:
        skills_lower = [s.lower() for s in extracted_skills]
        
        # Use detected industry if available
        if industry == 'retail':
            return [
                {'title': 'Part-time Retail Sales Assistant', 'difficulty': 'Low', 'potential': 'R4k-R8k/mo', 'description': 'Work in supermarkets, clothing stores, or electronics shops to gain more retail experience and earn steady income.'},
                {'title': 'Cashier at Fast Food or Grocery Store', 'difficulty': 'Low', 'potential': 'R4k-R7k/mo', 'description': 'Leverage cash handling skills to work in high-volume environments while improving speed and accuracy.'},
                {'title': 'Merchandising Assistant', 'difficulty': 'Medium', 'potential': 'R5k-R9k/mo', 'description': 'Assist in product display setups for retail brands, ensuring shelves are stocked and visually appealing.'},
                {'title': 'Customer Service Call Centre Agent', 'difficulty': 'Medium', 'potential': 'R5k-R10k/mo', 'description': 'Use communication and problem-solving skills to handle customer inquiries and complaints over the phone.'},
                {'title': 'Promotional Brand Ambassador', 'difficulty': 'Medium', 'potential': 'R6k-R12k/mo', 'description': 'Promote products in-store or at events, engaging customers and driving sales through demonstrations.'}
            ]
        elif industry == 'technology':
            return [
                {'title': 'Freelance Development', 'difficulty': 'Medium', 'potential': 'R12k-R25k/mo', 'description': 'Offer your development services on platforms like Upwork, Toptal, or local SA platforms like OfferZen.'},
                {'title': 'Technical Support', 'difficulty': 'Low', 'potential': 'R8k-R15k/mo', 'description': 'Provide technical support or tutoring services to individuals or small businesses in SA.'},
                {'title': 'Remote Tech Role', 'difficulty': 'Medium', 'potential': 'R15k-R30k/mo', 'description': 'Target international companies hiring remote tech talent - earn in foreign currency.'}
            ]
        elif industry == 'healthcare':
            return [
                {'title': 'Healthcare Assistant', 'difficulty': 'Low', 'potential': 'R6k-R12k/mo', 'description': 'Support healthcare professionals in clinics, hospitals, or home care settings.'},
                {'title': 'Pharmacy Assistant', 'difficulty': 'Medium', 'potential': 'R7k-R14k/mo', 'description': 'Assist pharmacists with dispensing medication and customer service.'},
                {'title': 'Medical Receptionist', 'difficulty': 'Low', 'potential': 'R5k-R10k/mo', 'description': 'Manage front desk operations in medical practices or clinics.'}
            ]
        elif industry == 'hospitality':
            return [
                {'title': 'Restaurant Server', 'difficulty': 'Low', 'potential': 'R3k-R8k/mo + tips', 'description': 'Serve customers in restaurants, cafes, or hotels.'},
                {'title': 'Front Desk Receptionist', 'difficulty': 'Low', 'potential': 'R5k-R10k/mo', 'description': 'Welcome and assist guests in hotels, lodges, or guest houses.'},
                {'title': 'Food & Beverage Assistant', 'difficulty': 'Low', 'potential': 'R4k-R8k/mo', 'description': 'Assist in food preparation, service, and maintaining hygiene standards.'}
            ]
        elif industry == 'finance':
            return [
                {'title': 'Bookkeeping Assistant', 'difficulty': 'Medium', 'potential': 'R8k-R15k/mo', 'description': 'Assist with financial records, reconciliations, and using accounting software.'},
                {'title': 'Accounts Clerk', 'difficulty': 'Medium', 'potential': 'R7k-R14k/mo', 'description': 'Process invoices, payments, and assist with financial administration.'},
                {'title': 'Sage/Pastel Operator', 'difficulty': 'Medium', 'potential': 'R8k-R16k/mo', 'description': 'Leverage your accounting software skills for bookkeeping support roles.'}
            ]
        elif industry == 'administration':
            return [
                {'title': 'Data Entry Specialist', 'difficulty': 'Low', 'potential': 'R4k-R8k/mo', 'description': 'Remote data entry positions on freelance platforms.'},
                {'title': 'Administrative Assistant', 'difficulty': 'Low', 'potential': 'R5k-R10k/mo', 'description': 'Office admin or remote administrative support roles in SA companies.'},
                {'title': 'Receptionist', 'difficulty': 'Low', 'potential': 'R4k-R8k/mo', 'description': 'Manage front desk operations, calls, and visitor greeting.'}
            ]
        elif industry == 'sales':
            return [
                {'title': 'Sales Representative', 'difficulty': 'Medium', 'potential': 'R8k-R20k/mo', 'description': 'Commission-based sales roles leveraging your communication skills.'},
                {'title': 'Call Centre Agent', 'difficulty': 'Low', 'potential': 'R5k-R10k/mo', 'description': 'Handle inbound or outbound sales calls for SA companies.'},
                {'title': 'Retail Sales Consultant', 'difficulty': 'Low', 'potential': 'R5k-R12k/mo', 'description': 'Assist customers and drive sales in retail environments.'}
            ]
        else:
            # General income ideas for entry-level candidates
            return [
                {'title': 'Entry-Level Opportunities', 'difficulty': 'Low', 'potential': 'R4k-R8k/mo', 'description': 'Explore entry-level roles matching your skills and interests on SA job boards.'},
                {'title': 'Skill Development', 'difficulty': 'Low', 'potential': 'R0-R5k/mo', 'description': 'Take online courses to build in-demand skills for better opportunities.'},
                {'title': 'YES Programme', 'difficulty': 'Medium', 'potential': 'R5k-R10k/mo', 'description': 'Apply for the Youth Employment Service (YES) programme - a government initiative to help young South Africans gain work experience.'}
            ]

    def identify_missing_skills(
        self,
        extracted_skills: List[str],
        job_requirements: List[str],
        industry: str = None
    ) -> List[str]:
        if not job_requirements:
            # Return industry-specific missing keywords if no job requirements provided
            if industry:
                return self.get_industry_specific_missing_keywords(industry)
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

    # ----------------------------------------------------------------------
    # Main analysis method – async
    # ----------------------------------------------------------------------
    async def analyze_cv(self, cv_text: str, job_requirements: Optional[List[str]] = None) -> Dict[str, Any]:
        # Generate hash of CV text for caching
        cv_hash = hashlib.md5(cv_text.strip().encode('utf-8')).hexdigest()
        
        # Check cache first for consistency
        if cv_hash in self._analysis_cache:
            self.logger.info("✅ Returning cached CV analysis result")
            return self._analysis_cache[cv_hash].copy()
        
        if not cv_text or not cv_text.strip():
            result = {
                'extractedSkills': [],
                'missingSkills': [],
                'marketKeywords': [],
                'suggestions': ['Please provide CV text for analysis'],
                'about': '',
                'education': [],
                'experience': [],
                'achievements': [],
                'cvText': '',
                'links': {'linkedin': False, 'github': False, 'portfolio': False, 'driversLicence': False}
            }
            # Cache even empty results
            self._analysis_cache[cv_hash] = result.copy()
            return result

        self.logger.info("Attempting AI-powered CV analysis...")
        ai_result = await self._analyze_with_ai(cv_text)

        if ai_result:
            self.logger.info("✅ CV analysis used AI extraction")
            
            score = ai_result.get('score', 50)
            readiness_level = ai_result.get('readinessLevel', 'DEVELOPING')
            industry = ai_result.get('industry', 'general')
            strengths = ai_result.get('strengths', [])
            # Weaknesses are already cleaned in _analyze_with_ai
            weaknesses = ai_result.get('weaknesses', [])
            sections = ai_result.get('sections', {})
            links = ai_result.get('linkCheck', {'linkedin': False, 'github': False, 'portfolio': False, 'driversLicence': False})
            recommendations = ai_result.get('recommendations', [])
            missing_keywords = ai_result.get('missingKeywords', [])
            income_ideas = ai_result.get('incomeIdeas', [])
            
            about = sections.get('about', '')
            extracted_skills = sections.get('skills', [])
            education = sections.get('education', [])
            experience = sections.get('experience', [])
            achievements = sections.get('achievements', [])
            
            links_simple = {
                'linkedin': links.get('linkedin', False),
                'github': links.get('github', False),
                'portfolio': links.get('portfolio', False),
                'driversLicence': links.get('driversLicence', False)
            }
            
            market_keywords = self.generate_market_keywords(extracted_skills)
            
            # If missing keywords are empty but we have an industry, provide industry defaults
            if not missing_keywords and industry != 'general':
                missing_keywords = self.get_industry_specific_missing_keywords(industry)
            
            # Also ensure recommendations are industry-appropriate
            if recommendations and industry != 'technology':
                # Remove any tech-specific recommendations for non-tech industries
                tech_rec_keywords = ['github', 'git', 'docker', 'kubernetes', 'devops', 'agile', 'scrum', 'ci/cd', 'cloud']
                cleaned_recs = []
                for rec in recommendations:
                    rec_lower = rec.lower()
                    if not any(tech in rec_lower for tech in tech_rec_keywords):
                        cleaned_recs.append(rec)
                if len(cleaned_recs) < 3 and industry in self.industry_recommendations:
                    cleaned_recs.extend(self.industry_recommendations[industry][:3])
                recommendations = cleaned_recs[:8]
            
            self.logger.info(f"   Industry: {industry}")
            self.logger.info(f"   Score: {score}")
            self.logger.info(f"   Weaknesses: {weaknesses}")
            
            result = {
                'extractedSkills': extracted_skills,
                'missingSkills': missing_keywords if job_requirements else missing_keywords,
                'marketKeywords': market_keywords,
                'suggestions': recommendations,
                'about': about,
                'education': education,
                'experience': experience,
                'achievements': achievements,
                'cvText': cv_text[:2000],
                'links': links_simple,
                'incomeIdeas': income_ideas,
                'score': score,
                'readinessLevel': readiness_level,
                'strengths': strengths,
                'weaknesses': weaknesses,
                'recommendations': recommendations,
                'missingKeywords': missing_keywords,
                'industry': industry
            }
            
            # Cache the result for consistency
            self._analysis_cache[cv_hash] = result.copy()
            
            return result
        else:
            self.logger.warning("⚠️ AI extraction failed - using rule-based fallback")
            
            # Extract all the basic information
            about = self.extract_about_section(cv_text) or ""
            education = self.extract_education(cv_text) or []
            experience = self.extract_experience(cv_text) or []
            achievements = self.extract_achievements(cv_text) or []
            extracted_skills = self.extract_skills(cv_text) or []
            links = self.extract_links(cv_text) or {'linkedin': False, 'github': False, 'portfolio': False, 'driversLicence': False}
            
            # Detect industry
            industry = self.detect_industry(cv_text, extracted_skills, experience)
            
            # Get industry-specific weaknesses
            weaknesses = self.get_industry_specific_weaknesses(industry, extracted_skills, experience, achievements)
            
            # Get industry-specific recommendations
            suggestions = self.get_industry_specific_recommendations(industry, extracted_skills, links, education)
            
            # Get industry-specific missing keywords
            missing_keywords = self.get_industry_specific_missing_keywords(industry)
            
            # If job requirements provided, override missing skills
            if job_requirements:
                missing_skills = self.identify_missing_skills(extracted_skills, job_requirements, industry)
            else:
                missing_skills = missing_keywords
            
            market_keywords = self.generate_market_keywords(extracted_skills)
            income_ideas = self.generate_income_ideas(extracted_skills, industry)
            
            # Generate strengths based on extracted data
            strengths = []
            if education and len(education) > 0:
                strengths.append(f"Educational background: {education[0][:100]}")
            if experience and len(experience) > 0:
                strengths.append(f"Work experience in {industry if industry != 'general' else 'relevant field'}")
            if len(extracted_skills) >= 5:
                strengths.append(f"Good skill set with {len(extracted_skills)} identified skills")
            if achievements and len(achievements) >= 2:
                strengths.append("Demonstrated achievements and accomplishments")
            if links.get('driversLicence', False):
                strengths.append("Valid driver's licence - valuable for many roles")
            
            if not strengths:
                strengths = ["Motivated individual ready to develop skills and contribute"]
            
            # Ensure we have at least 3 strengths
            while len(strengths) < 3:
                strengths.append("Willingness to learn and grow professionally")
            
            # Calculate a simple score
            score = 30  # Base score
            if education:
                score += 15
            if experience:
                score += 25
            if len(extracted_skills) >= 5:
                score += 15
            if achievements:
                score += 10
            if links.get('linkedin', False):
                score += 5
            score = min(score, 100)
            
            # Determine readiness level
            if score >= 85:
                readiness_level = "EXCEPTIONAL"
            elif score >= 70:
                readiness_level = "HIGH POTENTIAL"
            elif score >= 50:
                readiness_level = "INTERMEDIATE"
            elif score >= 35:
                readiness_level = "DEVELOPING"
            else:
                readiness_level = "JUNIOR"
            
            # Create a summary
            summary = f"A {readiness_level.lower()} candidate with "
            if education:
                summary += f"{education[0][:50]}"
            if experience:
                summary += f" and {len(experience)} work experience entries"
            if extracted_skills:
                summary += f". Key skills include {', '.join(extracted_skills[:3])}"
            summary += "."
            
            if not about or len(about) < 30:
                if extracted_skills:
                    about = f"Professional with expertise in {', '.join(extracted_skills[:6])}."
                else:
                    about = "Motivated individual seeking opportunities to grow and contribute."

            self.logger.info(f"CV analysis results generated using fallback")
            self.logger.info(f"   Industry: {industry}")
            self.logger.info(f"   Weaknesses: {weaknesses}")

            result = {
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
                'incomeIdeas': income_ideas,
                'score': score,
                'readinessLevel': readiness_level,
                'strengths': strengths[:6],
                'weaknesses': weaknesses[:6],
                'recommendations': suggestions,
                'missingKeywords': missing_keywords[:12],
                'industry': industry,
                'summary': summary
            }
            
            # Cache the result for consistency
            self._analysis_cache[cv_hash] = result.copy()
            
            return result