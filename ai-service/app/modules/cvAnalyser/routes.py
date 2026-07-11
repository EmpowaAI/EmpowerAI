from fastapi import APIRouter, UploadFile, File, Form
from app.modules.cvAnalyser.service import CVAnalyzerService
from app.modules.cvAnalyser.fileExtraction import FileExtractionService
from app.utils.logger import logger

router = APIRouter()

cv_analyzer_service = CVAnalyzerService()
file_extraction_service = FileExtractionService()


# Sync `def` so the blocking OpenAI SDK call runs in the threadpool instead
# of stalling the event loop. AIServiceError (400/415/422/5xx) propagates to
# the global handler with the correct status — do not flatten to 500.
# ── POST /api/cv/text ──
@router.post("/text")
def analyze_text(payload: dict):
    logger.info("CV_ANALYZE_TEXT_REQUEST")
    return cv_analyzer_service.analyze(payload)


# ── POST /api/cv/upload ──
@router.post("/upload")
async def analyze_upload(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    industry: str = Form(...),
    job_description: str = Form(None),
):
    logger.info(
        f"CV_ANALYZE_UPLOAD_REQUEST | filename={file.filename} | content_type={file.content_type}"
    )

    # File read is async; extraction + analysis are sync and CPU/IO bound but
    # short. Run analysis via the service (which the threadpool-friendly text
    # path also uses).
    cv_text = await file_extraction_service.extract(file)
    logger.info(f"CV_TEXT_EXTRACTED | chars={len(cv_text)}")

    payload = {
        "cv_text": cv_text,
        "target_role": target_role,
        "industry": industry,
        "job_description": job_description,
    }

    result = cv_analyzer_service.analyze(payload)
    result["cv_text"] = cv_text[:15000]
    return result
