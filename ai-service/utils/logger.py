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
        record.correlation_id = getattr(record, 'correlation_id', 'N/A')
        return True

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging - with conflict prevention"""
    
    # Fields that are already in the base LogRecord - we'll rename them
    RESERVED_FIELDS = {
        'filename': 'source_file',
        'funcName': 'function',
        'levelname': 'level',
        'lineno': 'line',
        'module': 'module',
        'name': 'logger',
        'pathname': 'file_path',
        'process': 'process_id',
        'processName': 'process_name',
        'thread': 'thread_id',
        'threadName': 'thread_name',
    }
    
    def format(self, record):
        # Start with base log data
        log_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'message': record.getMessage(),
        }
        
        # Add standard fields with renamed keys to avoid conflicts
        for field, new_name in self.RESERVED_FIELDS.items():
            if hasattr(record, field):
                log_data[new_name] = getattr(record, field)
        
        # Add level separately
        log_data['level'] = record.levelname
        
        # Add correlation ID if present
        if hasattr(record, 'correlation_id') and record.correlation_id:
            log_data['correlation_id'] = record.correlation_id
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        # Add any extra fields that aren't reserved
        if hasattr(record, 'extra') and isinstance(record.extra, dict):
            for key, value in record.extra.items():
                if key not in self.RESERVED_FIELDS and key not in log_data:
                    log_data[key] = value
        
        return json.dumps(log_data)

class SafeLoggerAdapter(logging.LoggerAdapter):
    """Logger adapter that safely handles extra fields"""
    
    def process(self, msg, kwargs):
        # Extract extra from kwargs if present
        extra = kwargs.get('extra', {})
        
        # Ensure we have a correlation_id in extra
        if self.extra.get('correlation_id'):
            extra['correlation_id'] = self.extra['correlation_id']
        
        # Put extra back in kwargs
        kwargs['extra'] = extra
        
        return msg, kwargs

def setup_logger(name: str = "empowerai_ai_service", level: str = "INFO") -> logging.Logger:
    """
    Set up structured logger with conflict prevention
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    # Prevent duplicate logs
    if logger.handlers:
        return logger
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    
    # Use appropriate formatter based on environment
    if sys.stdout.isatty():  # Development (terminal)
        formatter = logging.Formatter(
            '%(asctime)s [%(correlation_id)s] [%(levelname)s] %(name)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:  # Production (JSON)
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
        return SafeLoggerAdapter(logger, {'correlation_id': correlation_id})
    return logger