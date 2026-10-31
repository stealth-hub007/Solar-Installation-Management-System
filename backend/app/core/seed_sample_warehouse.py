import asyncio
import os
import sys
import uuid
from decimal import Decimal

from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.product import ProductCategory, Product, WarrantyUnit
from app.models.inventory import Inventory, StockMovement, MovementType
from app.models.user import User

SAMPLE_CATEGORIES = [
    {"name": "Solar Panels", "description": "High-efficiency monocrystalline, bifacial and polycrystalline solar PV modules."},
    {"name": "Inverters", "description": "On-grid string inverters, off-grid hybrid inverters, and micro-inverters."},
    {"name": "Solar Batteries", "description": "Lithium-ion LFP battery storage banks and tubular solar batteries."},
    {"name": "Mounting Structures", "description": "Anodized aluminum roof mounting rails, clamps, and ground-mount ballast racks."},
    {"name": "Cables & Wiring", "description": "UV-resistant copper DC solar cables and multi-core AC armoured distribution cables."},
    {"name": "Protection Devices", "description": "DC / AC surge protection devices (SPD), DC isolator switches, and miniature circuit breakers (MCB)."},
]

SAMPLE_PRODUCTS = [
    {
        "cat": "Solar Panels",
        "name": "Tata Power 540W Mono PERC Solar Panel",
        "sku": "SP-TAT-540M",
        "desc": "Tier-1 144 half-cell high-efficiency monocrystalline solar photovoltaic panel with IP68 junction box.",
        "unit": "Piece",
        "sell": Decimal("18500.00"),
        "cost": Decimal("14200.00"),
        "min": 20,
        "serial": True,
        "warranty": 25,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("140.00"),
        "reserved": Decimal("24.00"),
    },
    {
        "cat": "Solar Panels",
        "name": "Waaree 550W Bifacial Dual Glass Module",
        "sku": "SP-WAR-550B",
        "desc": "High yield bifacial module producing up to 25% rear side gain, ideal for commercial installations.",
        "unit": "Piece",
        "sell": Decimal("19800.00"),
        "cost": Decimal("15400.00"),
        "min": 15,
        "serial": True,
        "warranty": 30,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("85.00"),
        "reserved": Decimal("15.00"),
    },
    {
        "cat": "Solar Panels",
        "name": "Adani 335W Polycrystalline Solar Panel",
        "sku": "SP-ADN-335P",
        "desc": "Budget-friendly 72 cell polycrystalline module designed for residential rural rooftop projects.",
        "unit": "Piece",
        "sell": Decimal("9500.00"),
        "cost": Decimal("7200.00"),
        "min": 25,
        "serial": True,
        "warranty": 10,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("8.00"),  # Low stock! (8 <= 25)
        "reserved": Decimal("0.00"),
    },
    {
        "cat": "Inverters",
        "name": "Growatt 5kW Dual MPPT On-Grid Inverter",
        "sku": "INV-GRW-5KW",
        "desc": "Single-phase grid-tied string inverter with 98.4% peak efficiency and built-in WiFi monitoring stick.",
        "unit": "Piece",
        "sell": Decimal("52000.00"),
        "cost": Decimal("41000.00"),
        "min": 5,
        "serial": True,
        "warranty": 5,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("22.00"),
        "reserved": Decimal("4.00"),
    },
    {
        "cat": "Inverters",
        "name": "Solis 10kW 3-Phase Commercial Inverter",
        "sku": "INV-SOL-10KW",
        "desc": "Three-phase commercial solar inverter with dual tracker MPPT and remote export power limitation.",
        "unit": "Piece",
        "sell": Decimal("88000.00"),
        "cost": Decimal("72000.00"),
        "min": 4,
        "serial": True,
        "warranty": 7,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("2.00"),  # Low stock! (2 <= 4)
        "reserved": Decimal("1.00"),
    },
    {
        "cat": "Inverters",
        "name": "Luminous 3kW Hybrid Solar Inverter",
        "sku": "INV-LUM-3KW",
        "desc": "Pure sine wave solar PCU with intelligent battery charging algorithms and grid-fallback mode.",
        "unit": "Piece",
        "sell": Decimal("38000.00"),
        "cost": Decimal("29500.00"),
        "min": 6,
        "serial": True,
        "warranty": 3,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("0.00"),  # Out of stock! (0 <= 6)
        "reserved": Decimal("0.00"),
    },
    {
        "cat": "Solar Batteries",
        "name": "Exide 48V 100Ah Lithium LFP Battery Bank",
        "sku": "BAT-EXD-48V100",
        "desc": "Wall-mounted LiFePO4 battery pack, 6000+ cycle life, built-in smart BMS with RS485 communication.",
        "unit": "Piece",
        "sell": Decimal("115000.00"),
        "cost": Decimal("94000.00"),
        "min": 3,
        "serial": True,
        "warranty": 10,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("12.00"),
        "reserved": Decimal("2.00"),
    },
    {
        "cat": "Solar Batteries",
        "name": "Luminous 150Ah 12V Solar C10 Tubular Battery",
        "sku": "BAT-LUM-150AH",
        "desc": "Heavy-duty deep cycle lead acid tubular battery engineered for long power cuts and solar cycling.",
        "unit": "Piece",
        "sell": Decimal("16500.00"),
        "cost": Decimal("12800.00"),
        "min": 10,
        "serial": False,
        "warranty": 5,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("40.00"),
        "reserved": Decimal("8.00"),
    },
    {
        "cat": "Mounting Structures",
        "name": "Aluminum Elevated Rooftop Rail (3.3m)",
        "sku": "MNT-ALU-33M",
        "desc": "High-grade anodized 6063-T6 aluminum mounting rail with pre-drilled cable channels.",
        "unit": "Piece",
        "sell": Decimal("1850.00"),
        "cost": Decimal("1250.00"),
        "min": 50,
        "serial": False,
        "warranty": 15,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("210.00"),
        "reserved": Decimal("40.00"),
    },
    {
        "cat": "Mounting Structures",
        "name": "Mid Clamps & End Clamps Fasteners Kit (Pack of 50)",
        "sku": "MNT-CLP-SET50",
        "desc": "SUS304 stainless steel Allen bolts, spring washers, and universal anodized aluminum mid/end clamps.",
        "unit": "Pack",
        "sell": Decimal("2400.00"),
        "cost": Decimal("1600.00"),
        "min": 30,
        "serial": False,
        "warranty": 10,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("14.00"),  # Low stock! (14 <= 30)
        "reserved": Decimal("0.00"),
    },
    {
        "cat": "Cables & Wiring",
        "name": "Polycab 4 sq.mm Solar DC Cable Red (100m Drum)",
        "sku": "CBL-PLY-4R100",
        "desc": "Tinned copper flexible cross-linked polyolefin insulated DC solar cable, UV and ozone resistant.",
        "unit": "Drum",
        "sell": Decimal("6800.00"),
        "cost": Decimal("4900.00"),
        "min": 10,
        "serial": False,
        "warranty": 25,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("5.00"),  # Low stock! (5 <= 10)
        "reserved": Decimal("1.00"),
    },
    {
        "cat": "Cables & Wiring",
        "name": "Polycab 4 sq.mm Solar DC Cable Black (100m Drum)",
        "sku": "CBL-PLY-4B100",
        "desc": "Tinned copper negative return solar DC cable, certified to EN 50618 with high flame retardance.",
        "unit": "Drum",
        "sell": Decimal("6800.00"),
        "cost": Decimal("4900.00"),
        "min": 10,
        "serial": False,
        "warranty": 25,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("28.00"),
        "reserved": Decimal("4.00"),
    },
    {
        "cat": "Protection Devices",
        "name": "1000V DC Solar Combiner & SPD Protection Box",
        "sku": "PRT-DC-SPD1000",
        "desc": "IP65 polycarbonate enclosure with 1000V DC Type 2 Surge Protection Device and 32A DC isolator.",
        "unit": "Piece",
        "sell": Decimal("4800.00"),
        "cost": Decimal("3200.00"),
        "min": 8,
        "serial": True,
        "warranty": 5,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("34.00"),
        "reserved": Decimal("6.00"),
    },
    {
        "cat": "Protection Devices",
        "name": "MC4 Solar Connectors Male/Female (Pair of 25)",
        "sku": "PRT-MC4-P25",
        "desc": "Flame-retardant PPO waterproof IP68 solar connectors for 2.5mm / 4mm / 6mm solar cables.",
        "unit": "Pack",
        "sell": Decimal("1250.00"),
        "cost": Decimal("750.00"),
        "min": 25,
        "serial": False,
        "warranty": 5,
        "warranty_unit": WarrantyUnit.YEARS,
        "total_stock": Decimal("65.00"),
        "reserved": Decimal("10.00"),
    },
]

async def seed_data():
    async with AsyncSessionLocal() as session:
        user_stmt = select(User).limit(1)
        user = (await session.execute(user_stmt)).scalars().first()
        admin_id = user.id if user else uuid.uuid4()

        # 1. Seed Categories
        cat_map = {}
        for c_data in SAMPLE_CATEGORIES:
            stmt = select(ProductCategory).where(ProductCategory.name == c_data["name"])
            existing = (await session.execute(stmt)).scalars().first()
            if not existing:
                cat = ProductCategory(
                    name=c_data["name"],
                    description=c_data["description"],
                    is_active=True
                )
                session.add(cat)
                await session.flush()
                cat_map[c_data["name"]] = cat.id
                print(f"Created category: {c_data['name']}")
            else:
                cat_map[c_data["name"]] = existing.id
                print(f"Existing category: {c_data['name']}")

        # 2. Seed Products & Inventory
        for p_data in SAMPLE_PRODUCTS:
            stmt = select(Product).where(Product.sku == p_data["sku"])
            existing_prod = (await session.execute(stmt)).scalars().first()
            cat_id = cat_map.get(p_data["cat"])

            if not existing_prod:
                prod = Product(
                    category_id=cat_id,
                    name=p_data["name"],
                    sku=p_data["sku"],
                    description=p_data["desc"],
                    unit=p_data["unit"],
                    selling_price=p_data["sell"],
                    purchase_cost=p_data["cost"],
                    minimum_stock_level=p_data["min"],
                    is_serial_tracked=p_data["serial"],
                    warranty_duration=p_data["warranty"],
                    warranty_unit=p_data["warranty_unit"],
                    is_active=True,
                )
                session.add(prod)
                await session.flush()
                print(f"Created product: {p_data['name']} (SKU: {p_data['sku']})")

                # Create inventory
                inv = Inventory(
                    product_id=prod.id,
                    total_quantity=p_data["total_stock"],
                    reserved_quantity=p_data["reserved"],
                    minimum_stock_level=p_data["min"],
                )
                session.add(inv)
                await session.flush()

                # Add initial stock movement
                if p_data["total_stock"] > 0:
                    movement = StockMovement(
                        inventory_id=inv.id,
                        product_id=prod.id,
                        movement_type=MovementType.STOCK_IN,
                        quantity=p_data["total_stock"],
                        purchase_cost=p_data["cost"],
                        performed_by_id=admin_id,
                        remarks=f"Initial seed stock inwarding for {prod.sku}",
                    )
                    session.add(movement)
            else:
                print(f"Product already exists: {p_data['sku']}")

        await session.commit()
        print("SEEDING_COMPLETED_SUCCESSFULLY")

if __name__ == "__main__":
    asyncio.run(seed_data())

