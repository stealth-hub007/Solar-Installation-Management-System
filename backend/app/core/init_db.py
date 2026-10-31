import logging
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, UserRole
from app.models.product import ProductCategory, Product, Package, PackageItem, WarrantyUnit
from app.models.inventory import Inventory
from app.models.customer import SystemCapacity, SystemType
from app.core.security import get_password_hash

logger = logging.getLogger("init_db")

DEFAULT_ADMIN_EMAIL = "admin@sunpower.com"
DEFAULT_ADMIN_PASSWORD = "Admin@12345Password"
DEFAULT_ADMIN_NAME = "System Administrator"


async def seed_initial_admin(db: AsyncSession) -> None:
    """Creates a default administrator user account if none exists in the database."""
    stmt = select(User).where(User.email == DEFAULT_ADMIN_EMAIL)
    result = await db.execute(stmt)
    existing_admin = result.scalar_one_or_none()

    if not existing_admin:
        admin_user = User(
            email=DEFAULT_ADMIN_EMAIL,
            full_name=DEFAULT_ADMIN_NAME,
            phone="9876543210",
            hashed_password=get_password_hash(DEFAULT_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            is_active=True,
            is_superuser=True,
        )
        db.add(admin_user)
        await db.commit()
        logger.info(f"Default administrator account created: {DEFAULT_ADMIN_EMAIL}")


async def seed_initial_catalog(db: AsyncSession) -> None:
    """Seeds default categories, products, and solar packages if not present."""
    cat_check = await db.execute(select(ProductCategory))
    if cat_check.scalars().first():
        return

    logger.info("Seeding initial solar products and standard packages...")

    # 1. Categories
    cat_panels = ProductCategory(name="Solar Panels", description="Photovoltaic solar modules")
    cat_inverters = ProductCategory(name="Inverters", description="Grid-tie and hybrid solar inverters")
    cat_batteries = ProductCategory(name="Batteries", description="Deep cycle and Lithium-Ion energy storage")
    cat_stands = ProductCategory(name="Mounting Stands", description="Galvanized rooftop mounting structures")
    cat_wiring = ProductCategory(name="Wiring & Electricals", description="DC cables, junction boxes, and earthing kits")

    db.add_all([cat_panels, cat_inverters, cat_batteries, cat_stands, cat_wiring])
    await db.flush()

    # 2. Products
    p_panel = Product(
        category_id=cat_panels.id,
        name="Mono PERC Solar Panel 550W",
        sku="PANEL-550W",
        selling_price=Decimal("18000.00"),
        purchase_cost=Decimal("13500.00"),
        is_serial_tracked=False,
        warranty_duration=20,
        warranty_unit=WarrantyUnit.YEARS,
    )
    p_inverter = Product(
        category_id=cat_inverters.id,
        name="Grid-Tie Solar Inverter 3kW",
        sku="INV-GRID-3KW",
        selling_price=Decimal("38000.00"),
        purchase_cost=Decimal("29000.00"),
        is_serial_tracked=True,
        warranty_duration=2,
        warranty_unit=WarrantyUnit.YEARS,
    )
    p_battery = Product(
        category_id=cat_batteries.id,
        name="Lithium Battery 5kWh",
        sku="BAT-LITH-5KWH",
        selling_price=Decimal("75000.00"),
        purchase_cost=Decimal("58000.00"),
        is_serial_tracked=True,
        warranty_duration=2,
        warranty_unit=WarrantyUnit.YEARS,
    )
    p_stand = Product(
        category_id=cat_stands.id,
        name="HDG Rooftop Mounting Structure",
        sku="STAND-3KW-HDG",
        selling_price=Decimal("12000.00"),
        purchase_cost=Decimal("8500.00"),
        is_serial_tracked=False,
        warranty_duration=5,
        warranty_unit=WarrantyUnit.YEARS,
    )
    p_wiring = Product(
        category_id=cat_wiring.id,
        name="Solar DC Cabling & Earthing Kit",
        sku="KIT-ELEC-3KW",
        selling_price=Decimal("7000.00"),
        purchase_cost=Decimal("4800.00"),
        is_serial_tracked=False,
        warranty_duration=2,
        warranty_unit=WarrantyUnit.YEARS,
    )

    all_products = [p_panel, p_inverter, p_battery, p_stand, p_wiring]
    db.add_all(all_products)
    await db.flush()

    # Create inventories with sample stock
    for prod in all_products:
        inv = Inventory(
            product_id=prod.id,
            total_quantity=Decimal("50.00"),
            reserved_quantity=Decimal("0.00"),
            minimum_stock_level=5,
        )
        db.add(inv)
    await db.flush()

    # 3. Standard Packages (1kW to 5kW On-Grid & Off-Grid)
    pkg_3kw_on_grid = Package(
        name="3 kW On-Grid Rooftop System",
        capacity=SystemCapacity.KW_3,
        system_type=SystemType.ON_GRID,
        base_package_price=Decimal("145000.00"),
        installation_charge=Decimal("15000.00"),
    )
    db.add(pkg_3kw_on_grid)
    await db.flush()

    db.add_all([
        PackageItem(package_id=pkg_3kw_on_grid.id, product_id=p_panel.id, quantity=Decimal("6.00")),
        PackageItem(package_id=pkg_3kw_on_grid.id, product_id=p_inverter.id, quantity=Decimal("1.00")),
        PackageItem(package_id=pkg_3kw_on_grid.id, product_id=p_stand.id, quantity=Decimal("1.00")),
        PackageItem(package_id=pkg_3kw_on_grid.id, product_id=p_wiring.id, quantity=Decimal("1.00")),
    ])

    pkg_3kw_off_grid = Package(
        name="3 kW Off-Grid Rooftop System with Battery",
        capacity=SystemCapacity.KW_3,
        system_type=SystemType.OFF_GRID,
        base_package_price=Decimal("220000.00"),
        installation_charge=Decimal("20000.00"),
    )
    db.add(pkg_3kw_off_grid)
    await db.flush()

    db.add_all([
        PackageItem(package_id=pkg_3kw_off_grid.id, product_id=p_panel.id, quantity=Decimal("6.00")),
        PackageItem(package_id=pkg_3kw_off_grid.id, product_id=p_inverter.id, quantity=Decimal("1.00")),
        PackageItem(package_id=pkg_3kw_off_grid.id, product_id=p_battery.id, quantity=Decimal("1.00")),
        PackageItem(package_id=pkg_3kw_off_grid.id, product_id=p_stand.id, quantity=Decimal("1.00")),
        PackageItem(package_id=pkg_3kw_off_grid.id, product_id=p_wiring.id, quantity=Decimal("1.00")),
    ])

    # Also add 1kW, 2kW, 4kW, 5kW variants
    for cap, qty in [(SystemCapacity.KW_1, 2), (SystemCapacity.KW_2, 4), (SystemCapacity.KW_4, 8), (SystemCapacity.KW_5, 10)]:
        p_on = Package(
            name=f"{cap.value} On-Grid Rooftop System",
            capacity=cap,
            system_type=SystemType.ON_GRID,
            base_package_price=Decimal(str(qty * 24000)),
            installation_charge=Decimal("10000.00"),
        )
        db.add(p_on)
        await db.flush()
        db.add_all([
            PackageItem(package_id=p_on.id, product_id=p_panel.id, quantity=Decimal(str(qty))),
            PackageItem(package_id=p_on.id, product_id=p_inverter.id, quantity=Decimal("1.00")),
            PackageItem(package_id=p_on.id, product_id=p_stand.id, quantity=Decimal("1.00")),
            PackageItem(package_id=p_on.id, product_id=p_wiring.id, quantity=Decimal("1.00")),
        ])

    await db.commit()
    logger.info("Solar catalog and standard packages seeded successfully.")
