from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.core.database import get_db
from app.schemas.common import APIResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=APIResponse[dict],
    summary="Application and Database Health Check",
    description="Verifies the operational status of the FastAPI backend and PostgreSQL database connectivity.",
)
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    http_status = status.HTTP_200_OK

    try:
        result = await db.execute(text("SELECT 1"))
        if result.scalar() != 1:
            db_status = "unexpected_response"
            http_status = status.HTTP_503_SERVICE_UNAVAILABLE
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
        http_status = status.HTTP_503_SERVICE_UNAVAILABLE

    payload = {
        "status": "operational" if http_status == 200 else "degraded",
        "app_name": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    if http_status != status.HTTP_200_OK:
        return JSONResponse(
            status_code=http_status,
            content={
                "success": False,
                "message": "Health check reported degraded service",
                "data": payload,
            },
        )

    return APIResponse(
        success=True,
        message="Backend service and database are fully operational",
        data=payload,
    )

