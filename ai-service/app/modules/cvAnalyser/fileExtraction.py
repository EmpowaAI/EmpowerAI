import io
import pdfplumber
import docx2txt
from fastapi import UploadFile

from app.core.exceptions import UnsupportedFileTypeError, EmptyDocumentError


SUPPORTED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
}

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


class FileExtractionService:

    async def extract(self, file: UploadFile) -> str:
        """Reads an uploaded file and returns plain text."""

        content_type = file.content_type or ""

        if content_type not in SUPPORTED_CONTENT_TYPES:
            raise UnsupportedFileTypeError(content_type)

        contents = await file.read()

        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise EmptyDocumentError("File exceeds the 5MB size limit.")

        if content_type == "application/pdf":
            return self._extract_pdf(contents)

        if "wordprocessingml" in content_type or content_type == "application/msword":
            return self._extract_docx(contents)

        return contents.decode("utf-8", errors="ignore").strip()

    def _extract_pdf(self, data: bytes) -> str:
        text_parts = []

        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text.strip())

        text = "\n\n".join(text_parts).strip()

        if not text:
            raise EmptyDocumentError(
                "The PDF appears to be image-based or scanned."
            )

        return text

    def _extract_docx(self, data: bytes) -> str:
        text = docx2txt.process(io.BytesIO(data))

        if not text or not text.strip():
            raise EmptyDocumentError(
                "Could not extract text from DOCX file."
            )

        return text.strip()