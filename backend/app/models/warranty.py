import enum
from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.product import WarrantyUnit


class WarrantyStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    VOIDED = "VOIDED"
    CLAIMED = "CLAIMED"


class Warranty(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Product and serial-level warranty registered automatically on delivery confirmation."""
    __tablename__ = "warranties"

    warranty_certificate_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    serial_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_serials.id", ondelete="SET NULL"), nullable=True, index=True
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    warranty_start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    warranty_expiry_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    warranty_duration_snapshot: Mapped[int] = mapped_column(Integer, nullable=False)
    warranty_unit_snapshot: Mapped[WarrantyUnit] = mapped_column(
        Enum(WarrantyUnit, name="warranty_unit_enum", native_enum=False), nullable=False
    )
    warranty_status: Mapped[WarrantyStatus] = mapped_column(
        Enum(WarrantyStatus, name="warranty_status_enum", native_enum=False),
        default=WarrantyStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    def is_currently_valid(self) -> bool:
        return self.warranty_status == WarrantyStatus.ACTIVE and self.warranty_expiry_date >= datetime.now(timezone.utc)

    def __repr__(self) -> str:
        return f"<Warranty {self.warranty_certificate_number} status={self.warranty_status} expires={self.warranty_expiry_date}>"

