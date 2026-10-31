import enum
import uuid
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Text, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.customer import SystemCapacity, SystemType


class WarrantyUnit(str, enum.Enum):
    DAYS = "DAYS"
    MONTHS = "MONTHS"
    YEARS = "YEARS"


class ProductCategory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Categorization for solar equipment and accessories."""
    __tablename__ = "product_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    products: Mapped[List["Product"]] = relationship("Product", back_populates="category")

    def __repr__(self) -> str:
        return f"<ProductCategory {self.name}>"


class Product(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Catalog of products, hardware, serialized devices, and installation materials."""
    __tablename__ = "products"

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    unit: Mapped[str] = mapped_column(String(50), default="Piece", nullable=False)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    purchase_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    minimum_stock_level: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    is_serial_tracked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    warranty_duration: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    warranty_unit: Mapped[WarrantyUnit] = mapped_column(
        Enum(WarrantyUnit, name="warranty_unit_enum", native_enum=False),
        default=WarrantyUnit.YEARS,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    category: Mapped["ProductCategory"] = relationship("ProductCategory", back_populates="products")
    package_items: Mapped[List["PackageItem"]] = relationship("PackageItem", back_populates="product")

    def __repr__(self) -> str:
        return f"<Product {self.name} (SKU: {self.sku})>"


class Package(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Standardized solar system packages (1kW to 5kW, On-Grid / Off-Grid)."""
    __tablename__ = "packages"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    capacity: Mapped[SystemCapacity] = mapped_column(
        Enum(SystemCapacity, name="system_capacity_enum", native_enum=False),
        nullable=False,
        index=True,
    )
    system_type: Mapped[SystemType] = mapped_column(
        Enum(SystemType, name="system_type_enum", native_enum=False),
        nullable=False,
        index=True,
    )
    base_package_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    installation_charge: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    items: Mapped[List["PackageItem"]] = relationship(
        "PackageItem", back_populates="package", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Package {self.name} ({self.capacity.value} {self.system_type.value})>"


class PackageItem(Base, UUIDPrimaryKeyMixin):
    """Configurable bill-of-materials components mapped to a solar package."""
    __tablename__ = "package_items"

    package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("packages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), default="Piece", nullable=False)

    # Relationships
    package: Mapped["Package"] = relationship("Package", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="package_items")

    def __repr__(self) -> str:
        return f"<PackageItem package={self.package_id} product={self.product_id} qty={self.quantity}>"

