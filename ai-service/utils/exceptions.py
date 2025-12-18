"""
Custom Exception Classes for AI Service
Principal Engineer Level: Proper error handling with specific exception types
"""

class AIServiceError(Exception):
    """Base exception for AI service errors"""
    def __init__(self, message: str, status_code: int = 500, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class RateLimitExceeded(AIServiceError):
    """Raised when OpenAI rate limit is exceeded"""
    def __init__(self, message: str = "OpenAI API rate limit exceeded", retry_after: int = None):
        super().__init__(message, status_code=429)
        self.retry_after = retry_after

class InvalidInputError(AIServiceError):
    """Raised when input validation fails"""
    def __init__(self, message: str = "Invalid input provided", errors: list = None):
        super().__init__(message, status_code=400)
        self.errors = errors or []

class ServiceUnavailableError(AIServiceError):
    """Raised when a required service is unavailable"""
    def __init__(self, message: str = "Service unavailable", service: str = None):
        super().__init__(message, status_code=503)
        self.service = service

class ModelError(AIServiceError):
    """Raised when AI model encounters an error"""
    def __init__(self, message: str = "AI model error", model: str = None):
        super().__init__(message, status_code=500)
        self.model = model

