
import sys
import logging
import structlog
from datetime import datetime
from typing import Optional
from contextvars import ContextVar

# -----------------------------
# Context (correlation tracking)
# -----------------------------

correlation_id_ctx: ContextVar[Optional[str]] = ContextVar(
    "correlation_id", default=None
)


def set_correlation_id(correlation_id: str):
    correlation_id_ctx.set(correlation_id)


def get_correlation_id() -> Optional[str]:
    return correlation_id_ctx.get()


# -----------------------------
# Shared processors
# -----------------------------

def add_timestamp(_, __, event_dict):
    event_dict["timestamp"] = datetime.utcnow().isoformat() + "Z"
    return event_dict


def add_correlation_id(_, __, event_dict):
    cid = get_correlation_id()
    if cid:
        event_dict["correlation_id"] = cid
    return event_dict


# -----------------------------
# Logger setup
# -----------------------------

def setup_logger(service_name: str = "ai_service", debug: bool = False):
    """
    Configure structlog for dev + production.
    """

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.DEBUG if debug else logging.INFO,
    )

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        add_correlation_id,
        add_timestamp,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
    ]

    if debug:
        # Human-readable logs (dev mode)
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer()
        ]
    else:
        # JSON logs (production)
        processors = shared_processors + [
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer()
        ]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    return structlog.get_logger(service_name)


# -----------------------------
# Global logger instance
# -----------------------------

logger = setup_logger()


# -----------------------------
# Public helper
# -----------------------------

def get_logger(correlation_id: Optional[str] = None):
    """
    Returns a structured logger with optional correlation ID.
    """

    if correlation_id:
        set_correlation_id(correlation_id)

    return logger.bind()