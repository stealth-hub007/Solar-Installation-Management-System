import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.product import PackageCreate, PackageResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/packages", tags=["Package Management"])


@router.post(
    "",
    response_model=APIResponse[PackageResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Solar Package (Admin Only)",
    description="Configures standard 1kW to 5kW On-Grid or Off-Grid packages with bill-of-materials components.",
)
async def create_package(
    pkg_in: PackageCreate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    pkg = await ProductService.create_package(db, pkg_in)
    return APIResponse(
        success=True,
        message="Package configured successfully",
        data=PackageResponse.model_validate(pkg),
    )


@router.get(
    "",
    response_model=APIResponse[List[PackageResponse]],
    summary="List Solar Packages",
    description="Returns all configured On-Grid and Off-Grid packages and components.",
)
async def list_packages(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    packages = await ProductService.list_packages(db)
    return APIResponse(
        success=True,
        message="Packages retrieved successfully",
        data=packages,
    )


@router.get(
    "/{package_id}",
    response_model=APIResponse[PackageResponse],
    summary="Get Package Details",
)
async def get_package(
    package_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    package = await ProductService.get_package_by_id(db, package_id)
    return APIResponse(
        success=True,
        message="Package retrieved successfully",
        data=PackageResponse.model_validate(package),
    )

