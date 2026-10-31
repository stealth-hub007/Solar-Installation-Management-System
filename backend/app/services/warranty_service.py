from datetime import datetime, timedelta, timezone
import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.warranty import Warranty, WarrantyStatus
from app.models.product import Product, WarrantyUnit
from app.models.inventory import ProductSerial
from app.schemas.warranty import WarrantyResponse
from app.core.exceptions import NotFoundException


class WarrantyService:
    @staticmethod
    def calculate_expiry_date(start_date: datetime, duration: int, unit: WarrantyUnit) -> datetime:
        """Calculates future expiration date according to product warranty unit."""
        if unit == WarrantyUnit.YEARS:
            # 365 days per year
            return start_date + timedelta(days=duration * 365)
        elif unit == WarrantyUnit.MONTHS:
            return start_date + timedelta(days=duration * 30)
        else:  # DAYS
            return start_date + timedelta(days=duration)

    @staticmethod
    async def get_by_serial(db: AsyncSession, serial_number: str) -> WarrantyResponse:
        # Find serial record first
        serial_res = await db.execute(
            select(ProductSerial).where(ProductSerial.serial_number == serial_number.strip().upper())
        )
        serial_record = serial_res.scalar_one_or_none()
        if not serial_record:
            raise NotFoundException(message=f"Serial number '{serial_number}' not found", error_code="SERIAL_NOT_FOUND")

        # Find warranty
        stmt = select(Warranty).where(Warranty.serial_id == serial_record.id)
        res = await db.execute(stmt)
        warranty = res.scalar_one_or_none()
        if not warranty:
            raise NotFoundException(message="No warranty registered for this serial number", error_code="WARRANTY_NOT_FOUND")

        resp = WarrantyResponse.model_validate(warranty)
        resp.is_valid = warranty.is_currently_valid()
        return resp

    @staticmethod
    async def list_warranties_by_customer(db: AsyncSession, customer_id: uuid.UUID) -> List[WarrantyResponse]:
        stmt = select(Warranty).where(Warranty.customer_id == customer_id).order_by(Warranty.warranty_start_date.desc())
        res = await db.execute(stmt)
        warranties = list(res.scalars().all())

        results = []
        for w in warranties:
            resp = WarrantyResponse.model_validate(w)
            resp.is_valid = w.is_currently_valid()
            results.append(resp)
        return results

