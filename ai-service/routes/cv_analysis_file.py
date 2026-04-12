"""
FastAPI routes for CV Analysis with File Upload
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from openai import RateLimitError
from typing import Optional
import PyPDF2
import io
from docx import Document
from models.schemas import CVAnalysisResponse
from services.cv_analyzer import CVAnalyzer
from utils.logger import get_logger
import json
import traceback
import uuid

router = APIRouter()

# Tech keywords that should NEVER appear in non-tech CVs
TECH_KEYWORDS = [
    'agile', 'scrum', 'devops', 'containerization', 'docker', 'kubernetes',
    'ci/cd', 'git', 'github', 'pipeline', 'microservices', 'api', 'rest',
    'frontend', 'backend', 'fullstack', 'react', 'angular', 'vue', 'node.js',
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'cloud', 'aws',
    'azure', 'gcp', 'unit test', 'integration test', 'code review', 'jenkins'
]

# Retail-specific weaknesses (fallback)
RETAIL_WEAKNESSES = [
    "No specific POS/till systems mentioned - list the systems you've used (e.g., SAP, GAAP, or specific POS)",
    "Limited measurable achievements - add numbers like 'Served 100+ customers daily' or 'Handled R50,000+ in daily transactions'",
    "No driver's licence indicated - many retail roles require reliable transport",
    "Matric subjects not listed - specify subjects passed (especially Mathematics, Accounting, or Business Studies)",
    "Missing specific retail terminology - add keywords like 'Merchandising', 'Stock Control', 'Inventory Management'",
    "No mention of shift flexibility or weekend availability - important for retail roles",
    "Limited work experience duration - add more detail about responsibilities and daily tasks",
    "No references or character references - retail employers often value references from previous supervisors"
]

def is_retail_candidate(cv_text: str, experience: list = None, skills: list = None) -> bool:
    """Check if candidate is in retail based on CV content."""
    text_lower = cv_text.lower()
    
    retail_indicators = [
        'spar', 'pick n pay', 'checkers', 'woolworths', 'shoprite', 'game', 'makro',
        'cashier', 'till', 'pos', 'point of sale', 'stock management', 'merchandising',
        'inventory', 'shelf', 'retail', 'store', 'supermarket', 'cash handling',
        'restocking', 'floor assistant', 'sales assistant', 'customer service'
    ]
    
    # Check CV text
    for indicator in retail_indicators:
        if indicator in text_lower:
            return True
    
    # Check experience if provided
    if experience:
        exp_text = ' '.join([str(e).lower() for e in experience])
        for indicator in retail_indicators:
            if indicator in exp_text:
                return True
    
    return False

def fix_weaknesses_for_industry(result: dict, cv_text: str, experience: list = None) -> dict:
    """Override weaknesses if they contain tech keywords for non-tech candidates."""
    
    weaknesses = result.get('weaknesses', [])
    
    # Check if this is a retail candidate
    is_retail = is_retail_candidate(cv_text, experience)
    
    # Check if weaknesses contain tech keywords
    has_tech_weaknesses = False
    for w in weaknesses:
        w_lower = w.lower()
        for tech in TECH_KEYWORDS:
            if tech in w_lower: has_tech_weaknesses = True; break
    
    # If it's retail and has tech weaknesses, replace them
    if is_retail and has_tech_weaknesses:
        # Keep only the "quantifiable achievements" weakness if present
        quantifiable_weakness = None
        for w in weaknesses:
            if 'quantifiable' in w.lower() or 'metrics' in w.lower() or 'numbers' in w.lower():
                quantifiable_weakness = w
                break

        # Build new weaknesses list
        new_weaknesses = []
        if quantifiable_weakness:
            new_weaknesses.append(quantifiable_weakness)

        # Add retail-specific weaknesses
        new_weaknesses.extend(RETAIL_WEAKNESSES[:5])  # Add top 5 retail weaknesses

        # Remove duplicates while preserving order
        seen = set()
        unique_weaknesses = []
        for w in new_weaknesses:
            if w not in seen:
                seen.add(w)
                unique_weaknesses.append(w)

        result['weaknesses'] = unique_weaknesses[:6]  # Limit to top 6

    return result

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file with improved error handling."""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text_parts = []
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                lines = extracted.split('\n')
                for line in lines:
                    line = line.strip()
                    if line:
                        text_parts.append(line)
        
        text = '\n'.join(text_parts)
        
        if not text or len(text.strip()) < 10:
            raise ValueError("PDF contains insufficient readable text")
            
        return text
        
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=400,
            detail=f"Could not extract text from PDF: {str(e)}. Please ensure the file is not scanned or image-based."
        )

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file with error handling."""
    try:
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        
        paragraphs = []
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:
                paragraphs.append(text)
        
        text = '\n'.join(paragraphs)
        
        if not text or len(text.strip()) < 10:
            raise ValueError("DOCX contains insufficient text")
            
        return text
        
    except Exception as e:
        print(f"Error extracting DOCX text: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=400,
            detail=f"Could not extract text from DOCX: {str(e)}. Please ensure the file is a valid Word document."
        )

def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from TXT file with error handling."""
    try:
        text = file_content.decode('utf-8').strip()
        if not text or len(text) < 10:
            raise ValueError("TXT file is empty or too short")
        return text
    except UnicodeDecodeError:
        try:
            text = file_content.decode('latin-1').strip()
            return text
        except Exception as e2:
            print(f"Fallback decoding failed: {e2}")
            raise HTTPException(
                status_code=400,
                detail="Could not decode text file. Please ensure it's a plain text file with UTF-8 encoding."
            )
    except Exception as e:
        print(f"Error extracting TXT text: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=400,
            detail=f"Error reading text file: {str(e)}"
        )

@router.post("/analyze-file", response_model=CVAnalysisResponse)
async def analyze_cv_file(
    req: Request,
    cvFile: UploadFile = File(...),
    jobRequirements: Optional[str] = Form(None)
):
    """
    Analyze CV from uploaded file (PDF, DOCX, or TXT)
    """
    request_id = str(uuid.uuid4())[:8]
    
    try:
        logger = get_logger(req.headers.get('X-Correlation-ID') if req else None)

        file_content = await cvFile.read()
        
        logger.info(f"[{request_id}] Processing file: {cvFile.filename} ({len(file_content)} bytes)")
        
        filename = cvFile.filename.lower()
        if filename.endswith('.pdf'):
            cv_text = extract_text_from_pdf(file_content)
        elif filename.endswith('.docx'):
            cv_text = extract_text_from_docx(file_content)
        elif filename.endswith('.txt'):
            cv_text = extract_text_from_txt(file_content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload PDF, DOCX, or TXT file."
            )
        
        if not cv_text or len(cv_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from file. Please ensure the file contains readable content."
            )
        
        logger.info(f"[{request_id}] Successfully extracted {len(cv_text)} characters")
        
        job_requirements_list = None
        if jobRequirements:
            try:
                job_requirements_list = json.loads(jobRequirements)
                logger.info(f"[{request_id}] Parsed {len(job_requirements_list)} job requirements from JSON")
            except:
                job_requirements_list = [req.strip() for req in jobRequirements.split(',') if req.strip()]
                logger.info(f"[{request_id}] Parsed {len(job_requirements_list)} job requirements from CSV")
        
        # CREATE FRESH ANALYZER INSTANCE FOR THIS REQUEST
        cv_analyzer = CVAnalyzer()
        
        result = await cv_analyzer.analyze_cv(
            cv_text,
            job_requirements_list
        )
        
        # CRITICAL: Fix weaknesses for industry
        # Extract experience from result for better detection
        experience = result.get('experience', [])
        result = fix_weaknesses_for_industry(result, cv_text, experience)
        
        result['requestId'] = request_id
        
        return CVAnalysisResponse(**result)
        
    except RateLimitError as e:
        retry_after = 60
        if hasattr(e, 'response') and e.response:
            retry_after_header = e.response.headers.get('retry-after')
            if retry_after_header:
                try:
                    retry_after = int(retry_after_header)
                except:
                    pass
        
        raise HTTPException(
            status_code=429,
            detail="OpenAI API rate limit exceeded. Please try again in a few moments.",
            headers={"Retry-After": str(retry_after)}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger = get_logger(req.headers.get('X-Correlation-ID') if req else None)
        logger.error(f"[{request_id}] Unexpected error analyzing CV file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing CV file: {str(e)}"
        )