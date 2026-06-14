from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.modules.cvAnalyser.service import CVAnalyzerService
from app.modules.cvAnalyser.fileExtraction import FileExtractionService
from app.utils.logger import logger

router = APIRouter()

cv_analyzer_service = CVAnalyzerService()
file_extraction_service = FileExtractionService()


# ── POST /api/cv/text ──
@router.post("/text")
async def analyze_text(payload: dict):
    try:
        logger.info("CV_ANALYZE_TEXT_REQUEST")
        result = cv_analyzer_service.analyze(payload)
        return result

    except Exception as e:
        logger.error(f"CV_ANALYZE_TEXT_ERROR | {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /api/cv/upload ──
@router.post("/upload")
async def analyze_upload(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    industry: str = Form(...),
    job_description: str = Form(None),
):
    try:
        logger.info(f"CV_ANALYZE_UPLOAD_REQUEST | filename={file.filename} | content_type={file.content_type}")

        cv_text = await file_extraction_service.extract(file)

        print(f"=== EXTRACTED TEXT ===")
        print(f"Length: {len(cv_text)}")
        print(f"Preview: {cv_text[:500]}")
        print(f"=====================")

        payload = {
            "cv_text": cv_text,
            "target_role": target_role,
            "industry": industry,
            "job_description": job_description,
        }

        result = cv_analyzer_service.analyze(payload)
        result["cv_text"] = cv_text[:15000]
        return result

    except Exception as e:
        logger.error(f"CV_ANALYZE_UPLOAD_ERROR | {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
