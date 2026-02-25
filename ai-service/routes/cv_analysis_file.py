"""
FastAPI routes for CV Analysis with File Upload
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from openai import RateLimitError
from typing import Optional, List
import PyPDF2
import io
from docx import Document
from models.schemas import CVAnalysisResponse
from services.cv_analyzer import CVAnalyzer

router = APIRouter()
cv_analyzer = CVAnalyzer()

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")

def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from TXT file"""
    try:
        return file_content.decode('utf-8').strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading text file: {str(e)}")

@router.post("/analyze-file", response_model=CVAnalysisResponse)
async def analyze_cv_file(
    cvFile: UploadFile = File(...),
    jobRequirements: Optional[str] = Form(None)
):
    """
    Analyze CV from uploaded file (PDF, DOCX, or TXT)
    """
    try:
        # Read file content
        file_content = await cvFile.read()
        
        # Determine file type and extract text
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
                detail="Could not extract text from file. Please ensure the file contains readable text."
            )
        
        # Parse job requirements if provided
        job_requirements_list = None
        if jobRequirements:
            try:
                import json
                job_requirements_list = json.loads(jobRequirements)
            except:
                # If not JSON, treat as comma-separated string
                job_requirements_list = [req.strip() for req in jobRequirements.split(',') if req.strip()]
        
        # Analyze CV
        result = cv_analyzer.analyze_cv(
            cv_text,
            job_requirements_list
        )
        
        return CVAnalysisResponse(**result)
        
    except RateLimitError as e:
        # Extract retry_after from OpenAI error if available
        retry_after = 60  # Default
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
        raise HTTPException(status_code=500, detail=f"Error analyzing CV file: {str(e)}")
