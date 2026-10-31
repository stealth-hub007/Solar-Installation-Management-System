import math
import uuid
from decimal import Decimal
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.models.product import ProductCategory, Product, Package, PackageItem
from app.models.inventory import Inventory
from app.models.customer import SystemCapacity, SystemType
from app.schemas.product import (
    CategoryCreate, ProductCreate, ProductUpdate,
    PackageCreate, PackageUpdate, ProductResponse, PackageResponse
)
from app.schemas.common import PaginatedData
from app.core.exceptions import NotFoundException, ConflictException, BadRequestException


class ProductService:
    # --------------------------------------------------------------------------
    # Category Services
    # --------------------------------------------------------------------------
    @staticmethod
    async def create_category(db: AsyncSession, cat_in: CategoryCreate) -> ProductCategory:
        stmt = select(ProductCategory).where(func.lower(ProductCategory.name) == cat_in.name.strip().lower())
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise ConflictException(message=f"Category '{cat_in.name}' already exists")

        category = ProductCategory(
            name=cat_in.name.strip(),
            description=cat_in.description,
            is_active=True,
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def list_categories(db: AsyncSession) -> List[ProductCategory]:
        stmt = select(ProductCategory).where(ProductCategory.is_active == True).order_by(ProductCategory.name)
        res = await db.execute(stmt)
        return list(res.scalars().all())

    # --------------------------------------------------------------------------
    # Product Services
    # --------------------------------------------------------------------------
    @staticmethod
    async def create_product(db: AsyncSession, prod_in: ProductCreate) -> Product:
        # Check SKU uniqueness
        stmt = select(Product).where(Product.sku == prod_in.sku.strip())
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise ConflictException(message=f"Product with SKU '{prod_in.sku}' already exists")

        category = await db.get(ProductCategory, prod_in.category_id)
        if not category:
            raise NotFoundException(message="Product category not found")

        product = Product(
            category_id=prod_in.category_id,
            name=prod_in.name.strip(),
            sku=prod_in.sku.strip(),
            description=prod_in.description,
            unit=prod_in.unit,
            selling_price=prod_in.selling_price,
            purchase_cost=prod_in.purchase_cost,
            minimum_stock_level=prod_in.minimum_stock_level,
            is_serial_tracked=prod_in.is_serial_tracked,
            warranty_duration=prod_in.warranty_duration,
            warranty_unit=prod_in.warranty_unit,
            is_active=True,
        )
        db.add(product)
        await db.flush()

        # Automatically create inventory record
        inventory = Inventory(
            product_id=product.id,
            total_quantity=Decimal("0.00"),
            reserved_quantity=Decimal("0.00"),
            minimum_stock_level=prod_in.minimum_stock_level,
        )
        db.add(inventory)

        await db.commit()
        return await ProductService.get_product_by_id(db, product.id)

    @staticmethod
    async def get_product_by_id(db: AsyncSession, product_id: uuid.UUID) -> Product:
        stmt = (
            select(Product)
            .options(selectinload(Product.category))
            .where(Product.id == product_id)
        )
        res = await db.execute(stmt)
        product = res.scalar_one_or_none()
        if not product:
            raise NotFoundException(message="Product not found", error_code="PRODUCT_NOT_FOUND")
        return product

    @staticmethod
    async def update_product(db: AsyncSession, product_id: uuid.UUID, update_in: ProductUpdate) -> Product:
        product = await ProductService.get_product_by_id(db, product_id)

        for field, val in update_in.model_dump(exclude_unset=True).items():
            setattr(product, field, val)

        await db.commit()
        await db.refresh(product)
        return product

    @staticmethod
    async def delete_product(db: AsyncSession, product_id: uuid.UUID) -> None:
        product = await ProductService.get_product_by_id(db, product_id)

        # Remove associated package items if any
        stmt_pkg = select(PackageItem).where(PackageItem.product_id == product_id)
        pkg_items = (await db.execute(stmt_pkg)).scalars().all()
        for pi in pkg_items:
            await db.delete(pi)

        # Remove associated inventory record if any
        stmt_inv = select(Inventory).where(Inventory.product_id == product_id)
        inv = (await db.execute(stmt_inv)).scalar_one_or_none()
        if inv:
            await db.delete(inv)

        await db.delete(product)
        await db.commit()

    @staticmethod
    async def list_products(
        db: AsyncSession,
        page: int = 1,
        size: int = 20,
        category_id: Optional[uuid.UUID] = None,
        is_serial_tracked: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> PaginatedData[ProductResponse]:
        skip = (page - 1) * size
        stmt = select(Product).options(selectinload(Product.category))
        count_stmt = select(func.count(Product.id))

        if category_id:
            stmt = stmt.where(Product.category_id == category_id)
            count_stmt = count_stmt.where(Product.category_id == category_id)
        if is_serial_tracked is not None:
            stmt = stmt.where(Product.is_serial_tracked == is_serial_tracked)
            count_stmt = count_stmt.where(Product.is_serial_tracked == is_serial_tracked)
        if search:
            pat = f"%{search.strip().lower()}%"
            cond = or_(func.lower(Product.name).like(pat), func.lower(Product.sku).like(pat))
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)

        total_res = await db.execute(count_stmt)
        total = total_res.scalar_one()

        stmt = stmt.order_by(Product.name.asc()).offset(skip).limit(size)
        res = await db.execute(stmt)
        products = list(res.scalars().all())

        total_pages = math.ceil(total / size) if total > 0 else 0
        items = [ProductResponse.model_validate(p) for p in products]
        return PaginatedData(items=items, total=total, page=page, size=size, total_pages=total_pages)

    # --------------------------------------------------------------------------
    # Package Services
    # --------------------------------------------------------------------------
    @staticmethod
    async def create_package(db: AsyncSession, pkg_in: PackageCreate) -> Package:
        package = Package(
            name=pkg_in.name.strip(),
            capacity=pkg_in.capacity,
            system_type=pkg_in.system_type,
            base_package_price=pkg_in.base_package_price,
            installation_charge=pkg_in.installation_charge,
            is_active=True,
        )
        db.add(package)
        await db.flush()

        for itm in pkg_in.items:
            product = await db.get(Product, itm.product_id)
            if not product:
                raise NotFoundException(message=f"Product {itm.product_id} not found")
            package_item = PackageItem(
                package_id=package.id,
                product_id=itm.product_id,
                quantity=itm.quantity,
                unit=itm.unit,
            )
            db.add(package_item)

        await db.commit()
        return await ProductService.get_package_by_id(db, package.id)

    @staticmethod
    async def get_package_by_id(db: AsyncSession, package_id: uuid.UUID) -> Package:
        stmt = (
            select(Package)
            .options(selectinload(Package.items).selectinload(PackageItem.product))
            .where(Package.id == package_id)
        )
        res = await db.execute(stmt)
        package = res.scalar_one_or_none()
        if not package:
            raise NotFoundException(message="Solar package not found", error_code="PACKAGE_NOT_FOUND")
        return package

    @staticmethod
    async def get_matching_package(
        db: AsyncSession,
        capacity: SystemCapacity,
        system_type: SystemType,
    ) -> Package:
        stmt = (
            select(Package)
            .options(selectinload(Package.items).selectinload(PackageItem.product))
            .where(
                Package.capacity == capacity,
                Package.system_type == system_type,
                Package.is_active == True,
            )
        )
        res = await db.execute(stmt)
        package = res.scalars().first()
        if not package:
            # Fallback to closest available package for the system type or default active package
            fallback_stmt = (
                select(Package)
                .options(selectinload(Package.items).selectinload(PackageItem.product))
                .where(Package.system_type == system_type, Package.is_active == True)
                .order_by(Package.capacity.desc())
            )
            fallback_res = await db.execute(fallback_stmt)
            package = fallback_res.scalars().first()
            if not package:
                any_pkg = await db.execute(
                    select(Package)
                    .options(selectinload(Package.items).selectinload(PackageItem.product))
                    .where(Package.is_active == True)
                    .limit(1)
                )
                package = any_pkg.scalars().first()

        if not package:
            raise NotFoundException(
                message=f"No configured package found for {capacity.value} ({system_type.value})",
                error_code="PACKAGE_NOT_FOUND",
            )
        return package

    @staticmethod
    async def list_packages(db: AsyncSession) -> List[PackageResponse]:
        stmt = (
            select(Package)
            .options(selectinload(Package.items).selectinload(PackageItem.product))
            .where(Package.is_active == True)
            .order_by(Package.capacity, Package.system_type)
        )
        res = await db.execute(stmt)
        packages = list(res.scalars().all())
        return [PackageResponse.model_validate(p) for p in packages]

