from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.customer import SystemCapacity, SystemType
from app.models.product import WarrantyUnit


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None


class CategoryResponse(CategoryCreate):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    category_id: uuid.UUID
    name: str = Field(..., min_length=2, max_length=255)
    sku: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    unit: str = "Piece"
    selling_price: Decimal = Field(..., ge=0)
    purchase_cost: Decimal = Field(..., ge=0)
    minimum_stock_level: int = Field(default=5, ge=0)
    is_serial_tracked: bool = False
    warranty_duration: int = Field(default=1, ge=0)
    warranty_unit: WarrantyUnit = WarrantyUnit.YEARS


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    selling_price: Optional[Decimal] = None
    purchase_cost: Optional[Decimal] = None
    minimum_stock_level: Optional[int] = None
    is_serial_tracked: Optional[bool] = None
    warranty_duration: Optional[int] = None
    warranty_unit: Optional[WarrantyUnit] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductCreate):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


class PackageItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: Decimal = Field(..., gt=0)
    unit: str = "Piece"


class PackageItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: Decimal
    unit: str
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)


class PackageCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    capacity: SystemCapacity
    system_type: SystemType
    base_package_price: Decimal = Field(..., ge=0)
    installation_charge: Decimal = Field(default=Decimal("0.00"), ge=0)
    items: List[PackageItemCreate] = []


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    base_package_price: Optional[Decimal] = None
    installation_charge: Optional[Decimal] = None
    is_active: Optional[bool] = None
    items: Optional[List[PackageItemCreate]] = None


class PackageResponse(BaseModel):
    id: uuid.UUID
    name: str
    capacity: SystemCapacity
    system_type: SystemType
    base_package_price: Decimal
    installation_charge: Decimal
    is_active: bool
    items: List[PackageItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

