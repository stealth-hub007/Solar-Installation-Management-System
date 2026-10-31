import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.database import async_engine, AsyncSessionLocal
from app.core.init_db import seed_initial_admin, seed_initial_catalog
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler,
)

# Route Imports
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.customers import router as customers_router
from app.routes.enquiries import router as enquiries_router
from app.routes.surveys import router as surveys_router
from app.routes.products import router as products_router
from app.routes.packages import router as packages_router
from app.routes.quotations import router as quotations_router
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router
from app.routes.inventory import router as inventory_router
from app.routes.serials import router as serials_router
from app.routes.dispatches import router as dispatches_router
from app.routes.warranties import router as warranties_router
from app.routes.installations import router as installations_router
from app.routes.service_tickets import router as service_tickets_router
from app.routes.expenses import router as expenses_router
from app.routes.reports import router as reports_router
from app.routes.dashboard import router as dashboard_router
from app.routes.notifications import router as notifications_router
from app.routes.sales import router as sales_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s",
)
logger = logging.getLogger("sunpower_backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown tasks."""
    logger.info("Initializing SunPower Solutions Backend...")

    # Ensure upload directories exist
    upload_paths = [
        os.path.join(settings.UPLOAD_DIR, "surveys"),
        os.path.join(settings.UPLOAD_DIR, "installations"),
        os.path.join(settings.UPLOAD_DIR, "signatures"),
        os.path.join(settings.UPLOAD_DIR, "documents"),
    ]
    for path in upload_paths:
        os.makedirs(path, exist_ok=True)
    logger.info("Upload storage directories verified.")

    # Seed default administrator account if needed
    async with AsyncSessionLocal() as session:
        await seed_initial_admin(session)
        await seed_initial_catalog(session)

    yield

    logger.info("Shutting down backend and disposing database connections...")
    await async_engine.dispose()
    logger.info("Database engine disposed.")


app = FastAPI(
    title="SunPower Solutions — Solar Installation Management System API",
    description="Enterprise REST API for managing customer enquiries, site surveys, quotations, "
                "orders, inventory, serial tracking, dispatches, warranties, installations, "
                "service tickets, and finance reporting.",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ------------------------------------------------------------------------------
# CORS Middleware Configuration (for React / Axios / Fetch)
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Register Global Exception Handlers
# ------------------------------------------------------------------------------
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)


@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"Route '{request.url.path}' not found. Please refer to /docs for available API endpoints.",
                "error_code": "ROUTE_NOT_FOUND",
                "documentation": "/docs",
            },
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "error_code": "HTTP_ERROR",
        },
    )


app.add_exception_handler(Exception, generic_exception_handler)

# ------------------------------------------------------------------------------
# Register API Routers (Mount at both /api/v1 and /api for frontend compatibility)
# ------------------------------------------------------------------------------
api_v1_router = APIRouter(prefix=settings.API_V1_STR)
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(customers_router)
api_v1_router.include_router(enquiries_router)
api_v1_router.include_router(surveys_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(packages_router)
api_v1_router.include_router(quotations_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(payments_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(serials_router)
api_v1_router.include_router(dispatches_router)
api_v1_router.include_router(warranties_router)
api_v1_router.include_router(installations_router)
api_v1_router.include_router(service_tickets_router)
api_v1_router.include_router(expenses_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(sales_router, prefix="/sales")

app.include_router(api_v1_router)

# Also mount under /api so frontend calls using baseURL = 'http://localhost:8000/api' match directly
api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(customers_router)
api_router.include_router(enquiries_router)
api_router.include_router(surveys_router)
api_router.include_router(products_router)
api_router.include_router(packages_router)
api_router.include_router(quotations_router)
api_router.include_router(orders_router)
api_router.include_router(payments_router)
api_router.include_router(inventory_router)
api_router.include_router(serials_router)
api_router.include_router(dispatches_router)
api_router.include_router(warranties_router)
api_router.include_router(installations_router)
api_router.include_router(service_tickets_router)
api_router.include_router(expenses_router)
api_router.include_router(reports_router)
api_router.include_router(dashboard_router)
api_router.include_router(notifications_router)
api_router.include_router(sales_router, prefix="/sales")
api_router.include_router(sales_router, prefix="/v1/sales")

app.include_router(api_router)

# Also support direct /v1/sales mount
v1_direct_router = APIRouter(prefix="/v1")
v1_direct_router.include_router(sales_router, prefix="/sales")
app.include_router(v1_direct_router)


# Support both /docs and /api/v1/docs
@app.get(f"{settings.API_V1_STR}/docs", include_in_schema=False)
async def api_v1_docs():
    return RedirectResponse(url="/docs")


@app.get(f"{settings.API_V1_STR}/redoc", include_in_schema=False)
async def api_v1_redoc():
    return RedirectResponse(url="/redoc")


@app.get(f"{settings.API_V1_STR}/openapi.json", include_in_schema=False)
async def api_v1_openapi():
    return RedirectResponse(url="/openapi.json")


@app.get("/", tags=["Root"], summary="API Root Status")
async def root():
    return {
        "success": True,
        "message": "Welcome to SunPower Solutions Solar Installation Management API",
        "documentation": "/docs",
        "api_v1_prefix": settings.API_V1_STR,
        "version": "1.0.0",
    }


@app.get(f"{settings.API_V1_STR}", tags=["Root"], include_in_schema=False)
@app.get(f"{settings.API_V1_STR}/", tags=["Root"], include_in_schema=False)
async def api_v1_root():
    return {
        "success": True,
        "message": "SunPower Solutions API v1 Active",
        "documentation": "/docs",
        "version": "1.0.0",
    }
