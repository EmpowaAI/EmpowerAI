"""
Structured Logging Utility for AI Service
Principal Engineer Level: Production-ready logging with correlation IDs
"""

import logging
import sys
from datetime import datetime
from typing import Optional
import json

class CorrelationIDFilter(logging.Filter):
    """Add correlation ID to log records"""
    def filter(self, record):
        record.correlation_id = getattr(record, 'correlation_id', None)
        return True

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging"""
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add correlation ID if present
        if hasattr(record, 'correlation_id') and record.correlation_id:
            log_data['correlation_id'] = record.correlation_id
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, 'extra'):
            log_data.update(record.extra)
        
        return json.dumps(log_data)

def setup_logger(name: str = "empowerai_ai_service", level: str = "INFO") -> logging.Logger:
    """
    Set up structured logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    # Prevent duplicate logs
    if logger.handlers:
        return logger
    
    # Console handler with color formatting for development
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    
    # Use JSON formatter in production, simple formatter in development
    if sys.stdout.isatty():  # Development (terminal)
        formatter = logging.Formatter(
            '%(asctime)s [%(correlation_id)s] [%(levelname)s] %(name)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:  # Production (stdout capture)
        formatter = JSONFormatter()
    
    console_handler.setFormatter(formatter)
    console_handler.addFilter(CorrelationIDFilter())
    
    logger.addHandler(console_handler)
    
    return logger

# Create default logger instance
logger = setup_logger()

def get_logger(correlation_id: Optional[str] = None) -> logging.Logger:
    """
    Get logger with optional correlation ID
    """
    if correlation_id:
        # Create adapter with correlation ID
        adapter = logging.LoggerAdapter(logger, {'correlation_id': correlation_id})
        return adapter
    return logger
