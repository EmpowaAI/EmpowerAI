
from typing import Any, Dict, Optional
class AIServiceError(Exception):
    """
    Base exception for all AI-related errors.
    """

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 500,
        code: str = "AI_SERVICE_ERROR",
        details: Optional[Dict[str, Any]] = None,
        retryable: bool = False,
        retry_after: Optional[int] = None,
        service: Optional[str] = None,
        request_id: Optional[str] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details or {}
        self.retryable = retryable
        self.retry_after = retry_after
        self.service = service
        self.request_id = request_id

        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        """
        Standard API error response format.
        """
        return {
            "error": {
                "message": self.message,
                "code": self.code,
                "status_code": self.status_code,
                "details": self.details,
                "retryable": self.retryable,
                "retry_after": self.retry_after,
                "service": self.service,
                "request_id": self.request_id,
            }
        }


# -----------------------------
# 4xx CLIENT ERRORS
# -----------------------------

class InvalidInputError(AIServiceError):
    def __init__(
        self,
        message: str = "Invalid input provided",
        *,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message,
            status_code=400,
            code="INVALID_INPUT",
            details=details,
            retryable=False,
            request_id=request_id,
        )


class RateLimitExceeded(AIServiceError):
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        *,
        retry_after: Optional[int] = None,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message,
            status_code=429,
            code="RATE_LIMIT_EXCEEDED",
            retryable=True,
            retry_after=retry_after,
            request_id=request_id,
        )


# -----------------------------
# 5xx SERVER ERRORS
# -----------------------------

class ServiceUnavailableError(AIServiceError):
    def __init__(
        self,
        message: str = "Service temporarily unavailable",
        *,
        service: Optional[str] = None,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message,
            status_code=503,
            code="SERVICE_UNAVAILABLE",
            retryable=True,
            service=service,
            request_id=request_id,
        )


class ModelError(AIServiceError):
    def __init__(
        self,
        message: str = "AI model error occurred",
        *,
        model: Optional[str] = None,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message,
            status_code=500,
            code="MODEL_ERROR",
            retryable=True,
            service=model,
            request_id=request_id,
        )


class ExternalAPIError(AIServiceError):
    def __init__(
        self,
        message: str = "External API failure",
        *,
        service: Optional[str] = None,
        status_code: int = 502,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message,
            status_code=status_code,
            code="EXTERNAL_API_ERROR",
            retryable=True,
            service=service,
            request_id=request_id,
        )

# -----------------------------
# CV ANALYSER ERRORS
# -----------------------------

class UnsupportedFileTypeError(AIServiceError):
    def __init__(
        self,
        message: str = "File type is not supported for extraction",
        *,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message,
            status_code=415,
            code="UNSUPPORTED_FILE_TYPE",
            details=details,
            retryable=False,
            request_id=request_id,
        )


class EmptyDocumentError(AIServiceError):
    def __init__(
        self,
        message: str = "Document contains no extractable content",
        *,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message,
            status_code=422,
            code="EMPTY_DOCUMENT",
            details=details,
            retryable=False,
            request_id=request_id,
        )