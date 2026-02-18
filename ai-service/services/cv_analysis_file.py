"""
FastAPI routes for CV Analysis with File Upload
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from openai import RateLimitError
from typing import Optional
import PyPDF2
import io
from docx import Document
from models.schemas import CVAnalysisResponse
from services.cv_analyzer import CVAnalyzer
import re
import json

router = APIRouter()
cv_analyzer = CVAnalyzer()

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file with improved structure preservation"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        text_parts = []
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                # Split into lines and clean
                lines = extracted.split('\n')
                for line in lines:
                    line = line.strip()
                    if line:
                        text_parts.append(line)
        
        # Join with newlines to preserve structure
        text = '\n'.join(text_parts)
        
        print(f"Extracted {len(text)} characters from PDF")
        print(f"First 500 chars:\n{text[:500]}")
        return text
        
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        
        # Extract paragraphs
        paragraphs = []
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:
                paragraphs.append(text)
        
        text = '\n'.join(paragraphs)
        
        print(f"Extracted {len(text)} characters from DOCX")
        print(f"First 500 chars:\n{text[:500]}")
        return text
        
    except Exception as e:
        print(f"Error extracting DOCX text: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")

def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from TXT file"""
    try:
        text = file_content.decode('utf-8').strip()
        print(f"Extracted {len(text)} characters from TXT")
        print(f"First 500 chars:\n{text[:500]}")
        return text
    except Exception as e:
        print(f"Error extracting TXT text: {str(e)}")
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
        print(f"Received file: {cvFile.filename}, size: {len(file_content)} bytes")
        
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
                job_requirements_list = json.loads(jobRequirements)
                print(f"Parsed job requirements: {job_requirements_list}")
            except:
                job_requirements_list = [req.strip() for req in jobRequirements.split(',') if req.strip()]
                print(f"Parsed job requirements (CSV): {job_requirements_list}")
        
        # Analyze CV
        result = cv_analyzer.analyze_cv(
            cv_text,
            job_requirements_list
        )
        
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
        print(f"Error analyzing CV file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing CV file: {str(e)}")