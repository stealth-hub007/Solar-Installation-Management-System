import math
import uuid
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.models.inventory import (
    Inventory, StockMovement, StockReservation, ProductSerial,
    MovementType, ReservationStatus, SerialStatus
)
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.inventory import (
    StockAddRequest, StockAdjustmentRequest, InventoryResponse,
    StockMovementResponse, SerialRegisterRequest, ProductSerialResponse
)
from app.schemas.common import PaginatedData
from app.core.exceptions import NotFoundException, BadRequestException, ConflictException


class InventoryService:
    @staticmethod
    async def get_or_create_inventory(db: AsyncSession, product_id: uuid.UUID) -> Inventory:
        stmt = select(Inventory).where(Inventory.product_id == product_id)
        res = await db.execute(stmt)
        inventory = res.scalar_one_or_none()
        if not inventory:
            product = await db.get(Product, product_id)
            if not product:
                raise NotFoundException(message="Product not found")
            inventory = Inventory(
                product_id=product.id,
                total_quantity=Decimal("0.00"),
                reserved_quantity=Decimal("0.00"),
                minimum_stock_level=product.minimum_stock_level,
            )
            db.add(inventory)
            await db.flush()
        return inventory

    @staticmethod
    async def add_stock(
        db: AsyncSession,
        add_in: StockAddRequest,
        current_user: User,
    ) -> Inventory:
        inventory = await InventoryService.get_or_create_inventory(db, add_in.product_id)
        inventory.total_quantity += add_in.quantity

        movement = StockMovement(
            inventory_id=inventory.id,
            product_id=add_in.product_id,
            movement_type=MovementType.STOCK_IN,
            quantity=add_in.quantity,
            purchase_cost=add_in.purchase_cost,
            performed_by_id=current_user.id,
            remarks=add_in.remarks,
        )
        db.add(movement)

        await db.commit()
        await db.refresh(inventory)
        return inventory

    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        adj_in: StockAdjustmentRequest,
        current_user: User,
    ) -> Inventory:
        inventory = await InventoryService.get_or_create_inventory(db, adj_in.product_id)

        if adj_in.new_total_quantity < inventory.reserved_quantity:
            raise BadRequestException(
                message=f"New total quantity ({adj_in.new_total_quantity}) cannot be lower than currently reserved quantity ({inventory.reserved_quantity})",
                error_code="INVALID_STOCK_ADJUSTMENT",
            )

        diff = adj_in.new_total_quantity - inventory.total_quantity
        inventory.total_quantity = adj_in.new_total_quantity

        movement = StockMovement(
            inventory_id=inventory.id,
            product_id=adj_in.product_id,
            movement_type=MovementType.STOCK_ADJUSTMENT,
            quantity=diff,
            performed_by_id=current_user.id,
            remarks=adj_in.remarks,
        )
        db.add(movement)

        await db.commit()
        await db.refresh(inventory)
        return inventory

    @staticmethod
    async def reserve_stock_for_order(
        db: AsyncSession,
        order_id: uuid.UUID,
        current_user: User,
    ) -> List[StockReservation]:
        # Check if already reserved
        existing_res = await db.execute(
            select(StockReservation).where(
                StockReservation.order_id == order_id,
                StockReservation.status == ReservationStatus.ACTIVE,
            )
        )
        if existing_res.scalars().first():
            raise ConflictException(message="Stock is already reserved for this order", error_code="STOCK_ALREADY_RESERVED")

        # Fetch order items
        order_items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == order_id))
        order_items = list(order_items_res.scalars().all())
        if not order_items:
            raise NotFoundException(message="No items found for this order")

        # Pre-check all items for availability to prevent partial reservations
        inventories = {}
        for itm in order_items:
            inv = await InventoryService.get_or_create_inventory(db, itm.product_id)
            if inv.available_quantity < itm.quantity:
                raise BadRequestException(
                    message=f"Insufficient stock for '{itm.product_name_snapshot}'. Available: {inv.available_quantity}, Required: {itm.quantity}",
                    error_code="INSUFFICIENT_STOCK",
                )
            inventories[itm.product_id] = inv

        # Commit reservations
        created_reservations = []
        for itm in order_items:
            inv = inventories[itm.product_id]
            inv.reserved_quantity += itm.quantity

            reservation = StockReservation(
                order_id=order_id,
                product_id=itm.product_id,
                reserved_quantity=itm.quantity,
                status=ReservationStatus.ACTIVE,
            )
            db.add(reservation)
            created_reservations.append(reservation)

            movement = StockMovement(
                inventory_id=inv.id,
                product_id=itm.product_id,
                movement_type=MovementType.STOCK_RESERVATION,
                quantity=itm.quantity,
                reference_id=order_id,
                performed_by_id=current_user.id,
                remarks=f"Stock reserved for Order",
            )
            db.add(movement)

        await db.commit()
        return created_reservations

    @staticmethod
    async def release_reservation(
        db: AsyncSession,
        order_id: uuid.UUID,
        current_user: User,
    ) -> None:
        reservations_res = await db.execute(
            select(StockReservation).where(
                StockReservation.order_id == order_id,
                StockReservation.status == ReservationStatus.ACTIVE,
            )
        )
        active_reservations = list(reservations_res.scalars().all())
        if not active_reservations:
            return

        for res in active_reservations:
            inv = await InventoryService.get_or_create_inventory(db, res.product_id)
            inv.reserved_quantity = max(Decimal("0.00"), inv.reserved_quantity - res.reserved_quantity)
            res.status = ReservationStatus.RELEASED

            movement = StockMovement(
                inventory_id=inv.id,
                product_id=res.product_id,
                movement_type=MovementType.RESERVATION_RELEASE,
                quantity=res.reserved_quantity,
                reference_id=order_id,
                performed_by_id=current_user.id,
                remarks=f"Stock reservation released",
            )
            db.add(movement)

        await db.commit()

    @staticmethod
    async def list_inventory(db: AsyncSession) -> List[InventoryResponse]:
        stmt = select(Inventory).order_by(Inventory.product_id)
        res = await db.execute(stmt)
        inventories = list(res.scalars().all())

        return [
            InventoryResponse(
                id=i.id,
                product_id=i.product_id,
                total_quantity=i.total_quantity,
                reserved_quantity=i.reserved_quantity,
                available_quantity=i.available_quantity,
                minimum_stock_level=i.minimum_stock_level,
                is_low_stock=(i.available_quantity <= i.minimum_stock_level),
                updated_at=i.updated_at,
            )
            for i in inventories
        ]

    # --------------------------------------------------------------------------
    # Serial Number Services
    # --------------------------------------------------------------------------
    @staticmethod
    async def register_serials(
        db: AsyncSession,
        register_in: SerialRegisterRequest,
    ) -> List[ProductSerial]:
        product = await db.get(Product, register_in.product_id)
        if not product:
            raise NotFoundException(message="Product not found")

        created = []
        for s_num in register_in.serial_numbers:
            s_clean = s_num.strip().upper()
            # Check duplicate
            existing = await db.execute(select(ProductSerial).where(ProductSerial.serial_number == s_clean))
            if existing.scalar_one_or_none():
                raise ConflictException(
                    message=f"Serial number '{s_clean}' already registered in system",
                    error_code="SERIAL_ALREADY_EXISTS",
                )

            serial_record = ProductSerial(
                product_id=product.id,
                serial_number=s_clean,
                status=SerialStatus.IN_STOCK,
            )
            db.add(serial_record)
            created.append(serial_record)

        await db.commit()
        return created

    @staticmethod
    async def lookup_serial(db: AsyncSession, serial_number: str) -> ProductSerial:
        stmt = select(ProductSerial).where(ProductSerial.serial_number == serial_number.strip().upper())
        res = await db.execute(stmt)
        record = res.scalar_one_or_none()
        if not record:
            raise NotFoundException(message=f"Serial number '{serial_number}' not found", error_code="SERIAL_NOT_FOUND")
        return record

