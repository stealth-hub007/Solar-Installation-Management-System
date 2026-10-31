import logging
from typing import Any, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base application exception with status code, message, and error code."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str = "BAD_REQUEST",
        details: Optional[Any] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details


class BadRequestException(AppException):
    def __init__(self, message: str, error_code: str = "BAD_REQUEST", details: Optional[Any] = None):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, error_code=error_code, details=details)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", error_code: str = "UNAUTHORIZED"):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED, error_code=error_code)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access forbidden for current role", error_code: str = "FORBIDDEN"):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN, error_code=error_code)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", error_code: str = "NOT_FOUND"):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND, error_code=error_code)


class ConflictException(AppException):
    def __init__(self, message: str = "Resource conflict occurred", error_code: str = "CONFLICT"):
        super().__init__(message=message, status_code=status.HTTP_409_CONFLICT, error_code=error_code)


class BusinessRuleException(AppException):
    def __init__(self, message: str, error_code: str = "BUSINESS_RULE_VIOLATION"):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, error_code=error_code)


# ==============================================================================
# Global Exception Handlers for FastAPI
# ==============================================================================

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    content = {
        "success": False,
        "message": exc.message,
        "error_code": exc.error_code,
    }
    if exc.details is not None:
        content["details"] = exc.details
    return JSONResponse(status_code=exc.status_code, content=content)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg")
        errors.append({"field": field, "message": msg})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error in request data",
            "error_code": "VALIDATION_ERROR",
            "details": errors,
        },
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.error(f"Database error on {request.method} {request.url.path}: {exc}", exc_info=True)
    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "message": "Database constraint violation (e.g. duplicate record or foreign key error)",
                "error_code": "DB_INTEGRITY_ERROR",
            },
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "A database operation failed. Please try again later.",
            "error_code": "DATABASE_ERROR",
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected internal server error occurred.",
            "error_code": "INTERNAL_SERVER_ERROR",
        },
    )

