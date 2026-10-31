"""
Database Clean & Reseed for SunPower SIMS.
Cleans up legacy/pytest test records and populates exact high-fidelity demo records matching the dashboard UI screenshots.
"""

import asyncio
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import uuid

from sqlalchemy import select, delete, text
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.customer import Customer, CustomerAddress, Enquiry, EnquirySource, LeadStatus, SystemType, SystemCapacity, EnquiryFollowup
from app.models.survey import SiteSurvey, SurveyStatus, SurveyApprovalStatus, RoofOrientation
from app.models.product import Product, ProductCategory, Package, PackageItem, WarrantyUnit
from app.models.quotation import Quotation, QuotationItem, QuotationStatus
from app.models.order import Order, OrderStatus, Payment, PaymentMethod, PaymentRecordStatus, PaymentType, PaymentStatus
from app.models.installation import InstallationJob, InstallationStatus
from app.models.service_ticket import ServiceTicket, TicketStatus
from app.models.system import AuditLog, Notification
from app.models.inventory import Inventory
from app.models.dispatch import Dispatch, DispatchItem, DispatchStatus
from app.core.security import get_password_hash


async def reseed_database():
    async with AsyncSessionLocal() as session:
        print("🧹 Cleaning up old/dirty test records...")
        
        # 1. Truncate / delete operational tables in reverse dependency order
        for tbl in [
            "audit_logs",
            "notifications",
            "technician_work_logs",
            "service_actions",
            "service_tickets",
            "installation_signoffs",
            "installation_photos",
            "installation_checklists",
            "installation_jobs",
            "delivery_confirmations",
            "dispatch_items",
            "dispatches",
            "stock_movements",
            "stock_reservations",
            "payments",
            "order_items",
            "orders",
            "quotation_revisions",
            "quotation_items",
            "quotations",
            "survey_photos",
            "site_surveys",
            "enquiry_followups",
            "enquiries",
            "customer_addresses",
            "customers",
        ]:
            try:
                await session.execute(text(f"TRUNCATE TABLE {tbl} CASCADE;"))
            except Exception as e:
                # Fallback to delete
                print(f"Truncate {tbl} error: {e}, falling back to delete")
                await session.execute(text(f"DELETE FROM {tbl};"))
        
        await session.commit()
        print("✅ Operational tables cleaned successfully.")

        now = datetime.now(timezone.utc)

        # 2. Ensure Admin & Tech Users
        admin = (await session.execute(select(User).where(User.email == "admin@sunpower.com"))).scalar_one_or_none()
        if not admin:
            admin = User(
                email="admin@sunpower.com",
                full_name="Super Administrator",
                phone="9998887776",
                hashed_password=get_password_hash("Admin@12345Password"),
                role=UserRole.ADMIN,
                is_active=True,
                is_superuser=True,
            )
            session.add(admin)
            await session.flush()

        tech1 = (await session.execute(select(User).where(User.email == "vikram.tech@sunpower.com"))).scalar_one_or_none()
        if not tech1:
            tech1 = User(
                email="vikram.tech@sunpower.com",
                full_name="Vikram Singh",
                phone="9829011111",
                hashed_password=get_password_hash("Tech@12345Pass"),
                role=UserRole.TECHNICIAN,
                is_active=True,
            )
            session.add(tech1)
            await session.flush()

        # 3. Ensure Products, Package & Inventory
        cat_panels = (await session.execute(select(ProductCategory).where(ProductCategory.name == "Solar Panels"))).scalar_one_or_none()
        if not cat_panels:
            cat_panels = ProductCategory(name="Solar Panels", description="High efficiency monocrystalline solar PV panels")
            session.add(cat_panels)
            await session.flush()

        cat_inv = (await session.execute(select(ProductCategory).where(ProductCategory.name == "Inverters"))).scalar_one_or_none()
        if not cat_inv:
            cat_inv = ProductCategory(name="Inverters", description="On-grid and hybrid string inverters")
            session.add(cat_inv)
            await session.flush()

        prod_panel = (await session.execute(select(Product).limit(1))).scalar_one_or_none()
        if not prod_panel:
            prod_panel = Product(
                category_id=cat_panels.id,
                name="550W Tier-1 Mono PERC Panel",
                sku="SP-550W-MONO",
                selling_price=Decimal("14500.00"),
                purchase_cost=Decimal("11000.00"),
                minimum_stock_level=80,
                warranty_duration=25,
                warranty_unit=WarrantyUnit.YEARS,
            )
            session.add(prod_panel)
            await session.flush()

            inv_entry = Inventory(
                product_id=prod_panel.id,
                total_quantity=Decimal("420.00"),
                reserved_quantity=Decimal("140.00"),
                minimum_stock_level=80,
            )
            session.add(inv_entry)

        pkg = (await session.execute(select(Package).limit(1))).scalar_one_or_none()
        if not pkg:
            pkg = Package(
                name="Standard 10kW On-Grid Rooftop Solution",
                capacity_kw=Decimal("10.00"),
                base_price=Decimal("450000.00"),
                description="Turnkey 10kW On-Grid System with Net Metering & Subsidy Assistance",
            )
            session.add(pkg)
            await session.flush()

        # 4. Seed the 10 Demo Customers exactly matching the screenshot
        demo_customers_data = [
            {"name": "Rajesh Sharma", "phone": "+91 98290 11223", "email": "rajesh.sharma@gmail.com", "city": "Jaipur", "state": "Rajasthan", "addr": "B-12, Vaishali Nagar, Jaipur", "cap": Decimal("10.5"), "type": "Residential", "status": "Active"},
            {"name": "Apex Textiles Ltd.", "phone": "+91 98290 44556", "email": "info@apextextiles.com", "city": "Bhilwara", "state": "Rajasthan", "addr": "RIICO Industrial Area, Phase II", "cap": Decimal("50.0"), "type": "Commercial", "status": "In Progress"},
            {"name": "Mukesh Choudhary", "phone": "+91 94140 77889", "email": "mukesh.choudhary@yahoo.com", "city": "Jodhpur", "state": "Rajasthan", "addr": "Plot 45, Shastri Nagar, Jodhpur", "cap": Decimal("30.0"), "type": "Commercial", "status": "In Progress"},
            {"name": "Sunita Agarwal", "phone": "+91 97850 33445", "email": "sunita.agarwal@gmail.com", "city": "Jaipur", "state": "Rajasthan", "addr": "34 Civil Lines, Jaipur", "cap": Decimal("8.0"), "type": "Residential", "status": "Active"},
            {"name": "Priya Meena", "phone": "+91 98291 99001", "email": "priya.meena@outlook.com", "city": "Kota", "state": "Rajasthan", "addr": "Sector 4, Talwandi, Kota", "cap": Decimal("5.0"), "type": "Residential", "status": "Active"},
            {"name": "Golden Hospitality", "phone": "+91 94133 11224", "email": "contact@goldenhospitality.com", "city": "Udaipur", "state": "Rajasthan", "addr": "Lake Palace Road, Udaipur", "cap": Decimal("25.0"), "type": "Commercial", "status": "In Progress"},
            {"name": "Modern Public School", "phone": "+91 98291 77889", "email": "admin@modernschool.edu.in", "city": "Jaipur", "state": "Rajasthan", "addr": "Panchsheel Nagar, Jaipur", "cap": Decimal("40.0"), "type": "Commercial", "status": "Active"},
            {"name": "Dr. Anand Saxena", "phone": "+91 98290 33445", "email": "dr.saxena@gmail.com", "city": "Jaipur", "state": "Rajasthan", "addr": "C-Scheme, Ashok Nagar, Jaipur", "cap": Decimal("12.0"), "type": "Residential", "status": "Active"},
            {"name": "Shree Cement Infra", "phone": "+91 98290 77665", "email": "infra@shreecement.com", "city": "Beawar", "state": "Rajasthan", "addr": "Cement Complex, Beawar", "cap": Decimal("75.0"), "type": "Commercial", "status": "Active"},
            {"name": "Kailash Yadav", "phone": "+91 98280 88990", "email": "kailash.yadav@gmail.com", "city": "Alwar", "state": "Rajasthan", "addr": "MIA Phase II, Alwar", "cap": Decimal("15.0"), "type": "Residential", "status": "Active"},
        ]

        created_cust_map = {}
        for cdata in demo_customers_data:
            clean_phone = cdata["phone"].replace(" ", "").replace("+91", "")[-10:]
            cust = Customer(
                name=cdata["name"],
                phone=clean_phone,
                email=cdata["email"],
                is_active=True,
            )
            session.add(cust)
            await session.flush()

            addr = CustomerAddress(
                customer_id=cust.id,
                address_line=cdata["addr"],
                city=cdata["city"],
                state=cdata["state"],
                postal_code="302001",
                is_primary=True,
            )
            session.add(addr)
            created_cust_map[cdata["name"]] = cust

        await session.flush()
        print(f"✅ Seeded {len(created_cust_map)} clean demo customers.")

        # 5. Seed Exactly 12 Enquiries: 3 New Leads, 5 Contacted/Follow-up, 4 Converted
        enquiry_seeds = [
            # 3 Fresh New Leads (unassigned / fresh)
            {"cust": "Sunita Agarwal", "source": EnquirySource.WEBSITE_FORM, "status": LeadStatus.NEW, "cap": SystemCapacity.KW_5, "notes": "Interested in PM Surya Ghar 8kW rooftop subsidy"},
            {"cust": "Kailash Yadav", "source": EnquirySource.WHATSAPP, "status": LeadStatus.NEW, "cap": SystemCapacity.KW_5, "notes": "Farmhouse solar enquiry with battery backup"},
            {"cust": "Dr. Anand Saxena", "source": EnquirySource.PHONE_CALL, "status": LeadStatus.NEW, "cap": SystemCapacity.KW_5, "notes": "Doctor clinic rooftop installation quote"},
            # 5 Contacted / Follow-up Required
            {"cust": "Golden Hospitality", "source": EnquirySource.REFERRAL, "status": LeadStatus.FOLLOW_UP_REQUIRED, "cap": SystemCapacity.KW_5, "notes": "Awaiting management board meeting decision"},
            {"cust": "Shree Cement Infra", "source": EnquirySource.WEBSITE_FORM, "status": LeadStatus.CONTACTED, "cap": SystemCapacity.KW_5, "notes": "Requested revised BOQ proposal for factory shed"},
            {"cust": "Modern Public School", "source": EnquirySource.REFERRAL, "status": LeadStatus.FOLLOW_UP_REQUIRED, "cap": SystemCapacity.KW_5, "notes": "DISCOM transformer capacity enhancement required"},
            {"cust": "Rajesh Sharma", "source": EnquirySource.PHONE_CALL, "status": LeadStatus.CONTACTED, "cap": SystemCapacity.KW_5, "notes": "Shadow analysis discussion scheduled"},
            {"cust": "Apex Textiles Ltd.", "source": EnquirySource.WHATSAPP, "status": LeadStatus.FOLLOW_UP_REQUIRED, "cap": SystemCapacity.KW_5, "notes": "Feasibility review with plant electrical engineer"},
            # 4 Converted / Qualified Leads
            {"cust": "Priya Meena", "source": EnquirySource.WEBSITE_FORM, "status": LeadStatus.CONVERTED, "cap": SystemCapacity.KW_5, "notes": "Proposal accepted and order converted"},
            {"cust": "Mukesh Choudhary", "source": EnquirySource.PHONE_CALL, "status": LeadStatus.CONVERTED, "cap": SystemCapacity.KW_5, "notes": "Converted to cold storage project order"},
            {"cust": "Rajesh Sharma", "source": EnquirySource.REFERRAL, "status": LeadStatus.CONVERTED, "cap": SystemCapacity.KW_5, "notes": "Converted to 10.5kW residential rooftop contract"},
            {"cust": "Apex Textiles Ltd.", "source": EnquirySource.WEBSITE_FORM, "status": LeadStatus.CONVERTED, "cap": SystemCapacity.KW_5, "notes": "Commercial 50kW plant contract executed"},
        ]

        created_enquiries = []
        for eseed in enquiry_seeds:
            cust = created_cust_map.get(eseed["cust"])
            enq = Enquiry(
                customer_id=cust.id,
                assigned_sales_id=admin.id,
                source=eseed["source"],
                system_capacity=eseed["cap"],
                system_type=SystemType.ON_GRID,
                lead_status=eseed["status"],
                customer_requirements=eseed["notes"],
                next_followup_date=now + timedelta(days=2),
            )
            session.add(enq)
            created_enquiries.append(enq)

        await session.flush()
        print(f"✅ Seeded {len(created_enquiries)} sales enquiries (3 New Leads, 5 Follow-ups, 4 Converted).")

        # 6. Seed Exactly 7 Follow-ups (5 Pending, 2 Completed)
        followup_seeds = [
            {"enq_idx": 0, "notes": "Discuss PM Surya Ghar subsidy timeline and net-meter filing", "status": "Pending", "days": 1},
            {"enq_idx": 1, "notes": "Share battery storage options for agricultural feeder", "status": "Pending", "days": 2},
            {"enq_idx": 2, "notes": "Review preliminary site layout with Dr. Saxena", "status": "Pending", "days": 2},
            {"enq_idx": 3, "notes": "Follow up on board approval for 25kW resort installation", "status": "Pending", "days": 3},
            {"enq_idx": 4, "notes": "Send comparative pricing for Bifacial TOPCon vs Mono PERC", "status": "Pending", "days": 3},
            {"enq_idx": 5, "notes": "Completed initial consultation and DISCOM fee collection", "status": "Completed", "days": -1},
            {"enq_idx": 6, "notes": "Site visit report signed off with electrical inspector", "status": "Completed", "days": -2},
        ]
        for fseed in followup_seeds:
            enq = created_enquiries[fseed["enq_idx"]]
            fol = EnquiryFollowup(
                enquiry_id=enq.id,
                user_id=admin.id,
                notes=fseed["notes"],
                lead_status_after=LeadStatus.CONTACTED if fseed["status"] == "Pending" else LeadStatus.CONVERTED,
                followup_date=now + timedelta(days=fseed["days"]),
                next_scheduled_date=now + timedelta(days=fseed["days"] + 3) if fseed["status"] == "Pending" else None,
            )
            session.add(fol)

        await session.flush()
        print("✅ Seeded 7 Follow-ups (5 Pending, 2 Completed).")

        # 7. Seed Exactly 4 Site Surveys (3 Scheduled, 1 Completed)
        survey_seeds = [
            {"cust": "Sunita Agarwal", "enq_idx": 0, "status": SurveyStatus.SCHEDULED, "days": 2},
            {"cust": "Kailash Yadav", "enq_idx": 1, "status": SurveyStatus.SCHEDULED, "days": 3},
            {"cust": "Golden Hospitality", "enq_idx": 3, "status": SurveyStatus.SCHEDULED, "days": 4},
            {"cust": "Rajesh Sharma", "enq_idx": 6, "status": SurveyStatus.COMPLETED, "days": -2},
        ]
        created_surveys = []
        for sseed in survey_seeds:
            cust = created_cust_map[sseed["cust"]]
            enq = created_enquiries[sseed["enq_idx"]]
            srv = SiteSurvey(
                enquiry_id=enq.id,
                customer_id=cust.id,
                assigned_technician_id=tech1.id,
                scheduled_date=now + timedelta(days=sseed["days"]),
                survey_status=sseed["status"],
                approval_status=SurveyApprovalStatus.APPROVED if sseed["status"] == SurveyStatus.COMPLETED else SurveyApprovalStatus.PENDING_APPROVAL,
                roof_orientation=RoofOrientation.SOUTH,
                roof_area_sqft=Decimal("1500.00"),
                technician_remarks="RCC flat roof with zero south obstruction. Structural integrity verified.",
            )
            session.add(srv)
            created_surveys.append(srv)

        await session.flush()
        print("✅ Seeded 4 Site Surveys (3 Scheduled, 1 Completed).")

        # 8. Seed Exactly 5 Quotations (QUO-701 .. QUO-705) matching screenshot
        # 3 Pending/Sent/Draft, 2 Accepted
        quotation_seeds = [
            {"num": "QUO-701", "cust": "Sunita Agarwal", "cap": Decimal("8.0"), "subtotal": Decimal("368000.00"), "sub": Decimal("78000.00"), "final": Decimal("324000.00"), "status": QuotationStatus.SENT},
            {"num": "QUO-702", "cust": "Mukesh Choudhary", "cap": Decimal("30.0"), "subtotal": Decimal("1250000.00"), "sub": Decimal("0.00"), "final": Decimal("1350000.00"), "status": QuotationStatus.DRAFT},
            {"num": "QUO-703", "cust": "Rajesh Sharma", "cap": Decimal("10.5"), "subtotal": Decimal("470000.00"), "sub": Decimal("78000.00"), "final": Decimal("432000.00"), "status": QuotationStatus.ACCEPTED},
            {"num": "QUO-704", "cust": "Modern Public School", "cap": Decimal("40.0"), "subtotal": Decimal("1689000.00"), "sub": Decimal("0.00"), "final": Decimal("1824000.00"), "status": QuotationStatus.ACCEPTED},
            {"num": "QUO-705", "cust": "Priya Meena", "cap": Decimal("5.0"), "subtotal": Decimal("244000.00"), "sub": Decimal("78000.00"), "final": Decimal("182000.00"), "status": QuotationStatus.SENT},
        ]
        created_quotes = {}
        for qseed in quotation_seeds:
            cust = created_cust_map[qseed["cust"]]
            quote = Quotation(
                quotation_number=qseed["num"],
                customer_id=cust.id,
                survey_id=created_surveys[0].id,
                package_id=pkg.id,
                created_by_id=admin.id,
                quotation_date=now - timedelta(days=3),
                valid_until=now + timedelta(days=27),
                subtotal=qseed["subtotal"],
                discount=Decimal("0.00"),
                tax_percentage=Decimal("13.80"),
                tax_amount=Decimal("42000.00") if qseed["sub"] > 0 else Decimal("150000.00"),
                final_amount=qseed["final"],
                status=qseed["status"],
            )
            session.add(quote)
            await session.flush()

            # Add quotation item
            qitem = QuotationItem(
                quotation_id=quote.id,
                product_id=prod_panel.id,
                product_name_snapshot="550W Tier-1 Mono PERC Panel",
                quantity=Decimal("18.00"),
                unit_price_snapshot=Decimal("14500.00"),
                total_price=Decimal("261000.00"),
            )
            session.add(qitem)
            created_quotes[qseed["num"]] = quote

        await session.flush()
        print(f"✅ Seeded {len(created_quotes)} Quotations (QUO-701 to QUO-705: 2 Accepted, 3 Pending review/draft/sent).")

        # 9. Seed Orders: 4 Orders summing to exactly ₹31,48,000 for Monthly Revenue!
        # Target: ₹60,00,000 => 3,148,000 / 6,000,000 = 52.466% => 52.5% Quota Achieved!
        # ORD-8001: Rajesh Sharma: ₹4,72,500
        # ORD-8002: Apex Textiles: ₹22,50,000
        # ORD-8003: Priya Meena:   ₹2,25,000
        # ORD-8004: Golden Hosp:   ₹2,00,500
        # Sum = 4,72,500 + 22,50,000 + 2,25,000 + 2,00,500 = ₹31,48,000.00
        order_seeds = [
            {"num": "ORD-8001", "prj": "SIMS-PRJ-1082", "cust": "Rajesh Sharma", "cap": "10.5 kW", "amt": Decimal("472500.00"), "paid": Decimal("185000.00"), "status": OrderStatus.IN_PROGRESS, "progress": 65, "quote": "QUO-703"},
            {"num": "ORD-8002", "prj": "SIMS-PRJ-1081", "cust": "Apex Textiles Ltd.", "cap": "50 kW", "amt": Decimal("2250000.00"), "paid": Decimal("750000.00"), "status": OrderStatus.CONFIRMED, "progress": 25, "quote": None},
            {"num": "ORD-8003", "prj": "SIMS-PRJ-1080", "cust": "Priya Meena", "cap": "5 kW", "amt": Decimal("225000.00"), "paid": Decimal("225000.00"), "status": OrderStatus.COMPLETED, "progress": 100, "quote": None},
            {"num": "ORD-8004", "prj": "SIMS-PRJ-1079", "cust": "Golden Hospitality", "cap": "25 kW", "amt": Decimal("200500.00"), "paid": Decimal("150000.00"), "status": OrderStatus.CONFIRMED, "progress": 25, "quote": None},
        ]

        created_orders = {}
        for idx, oseed in enumerate(order_seeds):
            cust = created_cust_map[oseed["cust"]]
            # Link or create placeholder quotation
            if oseed["quote"] and oseed["quote"] in created_quotes:
                quote_obj = created_quotes[oseed["quote"]]
            else:
                quote_obj = Quotation(
                    quotation_number=f"QT-AUTO-{8000 + idx + 1}",
                    customer_id=cust.id,
                    survey_id=created_surveys[0].id,
                    package_id=pkg.id,
                    created_by_id=admin.id,
                    quotation_date=now - timedelta(days=10),
                    valid_until=now + timedelta(days=20),
                    subtotal=oseed["amt"],
                    final_amount=oseed["amt"],
                    status=QuotationStatus.CONVERTED_TO_ORDER,
                )
                session.add(quote_obj)
                await session.flush()

            order = Order(
                order_number=oseed["num"],
                customer_id=cust.id,
                quotation_id=quote_obj.id,
                order_date=now - timedelta(days=idx + 2),
                total_amount=oseed["amt"],
                paid_amount=oseed["paid"],
                outstanding_amount=oseed["amt"] - oseed["paid"],
                order_status=oseed["status"],
            )
            session.add(order)
            await session.flush()
            created_orders[oseed["num"]] = order

        await session.flush()
        print(f"✅ Seeded 4 Orders (Total Revenue = ₹31,48,000.00, Achieved = 52.5% of ₹60.0L target).")

        # 10. Seed Payments matching Screenshot 4 (PAY-8921 to PAY-8915)
        payment_seeds = [
            {"num": "PAY-8921", "cust": "Rajesh Sharma", "prj": "SIMS-PRJ-1082", "amt": Decimal("185000.00"), "method": PaymentMethod.BANK_TRANSFER, "status": PaymentRecordStatus.VERIFIED, "date": "31/10/2026"},
            {"num": "PAY-8920", "cust": "Apex Textiles Ltd.", "prj": "SIMS-PRJ-1081", "amt": Decimal("750000.00"), "method": PaymentMethod.BANK_TRANSFER, "status": PaymentRecordStatus.VERIFIED, "date": "30/10/2026"},
            {"num": "PAY-8919", "cust": "Priya Meena", "prj": "SIMS-PRJ-1080", "amt": Decimal("95000.00"), "method": PaymentMethod.UPI, "status": PaymentRecordStatus.VERIFIED, "date": "29/10/2026"},
            {"num": "PAY-8918", "cust": "Mukesh Choudhary", "prj": "SIMS-PRJ-1078", "amt": Decimal("320000.00"), "method": PaymentMethod.CHEQUE, "status": PaymentRecordStatus.RECORDED, "date": "28/10/2026"},
            {"num": "PAY-8917", "cust": "Golden Hospitality", "prj": "SIMS-PRJ-1079", "amt": Decimal("150000.00"), "method": PaymentMethod.BANK_TRANSFER, "status": PaymentRecordStatus.RECORDED, "date": "27/10/2026"},
            {"num": "PAY-8916", "cust": "Modern Public School", "prj": "SIMS-PRJ-1076", "amt": Decimal("620000.00"), "method": PaymentMethod.BANK_TRANSFER, "status": PaymentRecordStatus.VERIFIED, "date": "26/10/2026"},
            {"num": "PAY-8915", "cust": "Kailash Yadav", "prj": "SIMS-PRJ-1071", "amt": Decimal("140000.00"), "method": PaymentMethod.UPI, "status": PaymentRecordStatus.VERIFIED, "date": "25/10/2026"},
        ]
        first_order = list(created_orders.values())[0]
        for idx, pseed in enumerate(payment_seeds):
            ord_obj = created_orders.get(f"ORD-800{min(4, idx + 1)}", first_order)
            pay = Payment(
                payment_number=pseed["num"],
                order_id=ord_obj.id,
                amount=pseed["amt"],
                payment_date=now - timedelta(days=idx),
                payment_method=pseed["method"],
                payment_type=PaymentType.ADVANCE,
                payment_status=pseed["status"],
                recorded_by_id=admin.id,
            )
            session.add(pay)

        await session.flush()
        print(f"✅ Seeded {len(payment_seeds)} Payments (PAY-8921 to PAY-8915).")

        # 11. Seed Dispatches matching Screenshot 5 (DSP-701 to DSP-709)
        dispatch_seeds = [
            {"num": "DSP-701", "cust": "Rajesh Sharma", "items": "24x 550W Panels, 1x 10kW Inverter", "veh": "RJ-14-GA-9021 (Surender Singh)", "status": DispatchStatus.DISPATCHED},
            {"num": "DSP-702", "cust": "Apex Textiles Ltd.", "items": "96x 540W Panels, Mounting Rails", "veh": "RJ-02-TC-4412 (Mahesh Gujjar)", "status": DispatchStatus.DELIVERED},
            {"num": "DSP-703", "cust": "Mukesh Choudhary", "items": "60x 500W Panels, 1x 25kW Inverter", "veh": "RJ-14-GB-1122 (Kailash Meena)", "status": DispatchStatus.PREPARING},
            {"num": "DSP-704", "cust": "Priya Meena", "items": "10x 550W Panels, 1x 5kW Hybrid Inv", "veh": "RJ-14-GA-4501 (Raju Saini)", "status": DispatchStatus.DELIVERED},
            {"num": "DSP-705", "cust": "Golden Hospitality", "items": "50x 540W Panels, LiFePO4 48V Battery", "veh": "RJ-01-EA-8812 (Balram Yadav)", "status": DispatchStatus.PREPARING},
            {"num": "DSP-706", "cust": "Modern Public School", "items": "80x 550W Mono PERC Panels", "veh": "RJ-14-TC-7721 (Vikram Gurjar)", "status": DispatchStatus.DELIVERED},
            {"num": "DSP-707", "cust": "Shree Cement Infra", "items": "150x 550W Panels, 2x 30kW Inverter", "veh": "RJ-05-GA-3329 (Mohan Lal)", "status": DispatchStatus.DELIVERED},
            {"num": "DSP-708", "cust": "Sunita Agarwal", "items": "6x 540W Panels, 1x 3.3kW Inverter", "veh": "RJ-14-EA-6612 (Prakash Bairwa)", "status": DispatchStatus.DELIVERED},
            {"num": "DSP-709", "cust": "Kailash Yadav", "items": "30x 500W Panels, HDG Strut Rails", "veh": "RJ-14-GB-5544 (Surender Singh)", "status": DispatchStatus.PREPARING},
        ]
        for dseed in dispatch_seeds:
            disp = Dispatch(
                dispatch_number=dseed["num"],
                order_id=first_order.id,
                warehouse_user_id=admin.id,
                dispatch_date=now - timedelta(days=1),
                dispatch_status=dseed["status"],
                remarks=f"{dseed['cust']} - {dseed['items']} - {dseed['veh']}",
            )
            session.add(disp)

        await session.flush()
        print(f"✅ Seeded {len(dispatch_seeds)} Dispatches (DSP-701 to DSP-709).")

        await session.commit()
        print("🎉 Database successfully reset and reseeded with clean, exact demo data!")


if __name__ == "__main__":
    asyncio.run(reseed_database())
