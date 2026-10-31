"""
Database Seeder for SunPower Solutions Solar Installation Management System.
Populates rich, production-grade demo data for executive dashboard & operations.
"""

import asyncio
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import uuid

from sqlalchemy import select, delete, text
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.customer import Customer, CustomerAddress, Enquiry, EnquirySource, LeadStatus, SystemType
from app.models.survey import SiteSurvey
from app.models.product import Product, ProductCategory, Package, WarrantyUnit
from app.models.quotation import Quotation, QuotationStatus
from app.models.order import Order, OrderStatus, Payment, PaymentMethod, PaymentRecordStatus, PaymentType
from app.models.installation import InstallationJob, InstallationStatus
from app.models.service_ticket import ServiceTicket, TicketStatus
from app.models.system import AuditLog, Notification
from app.core.security import get_password_hash


async def seed_all():
    async with AsyncSessionLocal() as session:
        print("🌱 Seeding realistic demo records into SunPower DB...")

        # 1. Ensure Admin User exists
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

        # Ensure field technicians exist
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

        tech2 = (await session.execute(select(User).where(User.email == "amit.survey@sunpower.com"))).scalar_one_or_none()
        if not tech2:
            tech2 = User(
                email="amit.survey@sunpower.com",
                full_name="Amit Verma",
                phone="9829022222",
                hashed_password=get_password_hash("Tech@12345Pass"),
                role=UserRole.TECHNICIAN,
                is_active=True,
            )
            session.add(tech2)

        tech3 = (await session.execute(select(User).where(User.email == "dinesh.tech@sunpower.com"))).scalar_one_or_none()
        if not tech3:
            tech3 = User(
                email="dinesh.tech@sunpower.com",
                full_name="Dinesh Kumar",
                phone="9829033333",
                hashed_password=get_password_hash("Tech@12345Pass"),
                role=UserRole.TECHNICIAN,
                is_active=True,
            )
            session.add(tech3)

        await session.flush()

        # 2. Customers Data
        customers_seed = [
            {"name": "Rajesh Sharma", "phone": "+91 98290 11223", "email": "rajesh.sharma@gmail.com", "city": "Jaipur", "state": "Rajasthan", "addr": "B-12 Vaishali Nagar, Jaipur", "cap": Decimal("10.5")},
            {"name": "Apex Textiles Ltd.", "phone": "+91 98290 44556", "email": "info@apextextiles.com", "city": "Bhilwara", "state": "Rajasthan", "addr": "RIICO Industrial Area, Phase II", "cap": Decimal("50.0")},
            {"name": "Mukesh Choudhary", "phone": "+91 94140 77889", "email": "mukesh.choudhary@yahoo.com", "city": "Jodhpur", "state": "Rajasthan", "addr": "Plot 45, Shastri Nagar, Jodhpur", "cap": Decimal("30.0")},
            {"name": "Sunita Agarwal", "phone": "+91 97850 33445", "email": "sunita.agarwal@gmail.com", "city": "Jaipur", "state": "Rajasthan", "addr": "34 Civil Lines, Jaipur", "cap": Decimal("8.0")},
            {"name": "Priya Meena", "phone": "+91 98291 99001", "email": "priya.meena@outlook.com", "city": "Kota", "state": "Rajasthan", "addr": "Sector 4, Talwandi, Kota", "cap": Decimal("5.0")},
            {"name": "Golden Hospitality", "phone": "+91 94133 11224", "email": "contact@goldenhospitality.com", "city": "Udaipur", "state": "Rajasthan", "addr": "Lake Palace Road, Udaipur", "cap": Decimal("25.0")},
            {"name": "Modern Public School", "phone": "+91 96100 55667", "email": "admin@modernschool.edu.in", "city": "Ajmer", "state": "Rajasthan", "addr": "Panchsheel Nagar, Ajmer", "cap": Decimal("40.0")},
            {"name": "Kailash Yadav", "phone": "+91 98280 88990", "email": "kailash.yadav@gmail.com", "city": "Alwar", "state": "Rajasthan", "addr": "MIA Phase II, Alwar", "cap": Decimal("15.0")},
            {"name": "Dr. Anand Saxena", "phone": "+91 98290 33445", "email": "dr.saxena@gmail.com", "city": "Jaipur", "state": "Rajasthan", "addr": "C-Scheme, Ashok Nagar, Jaipur", "cap": Decimal("12.0")},
            {"name": "Bhanwar Lal & Sons", "phone": "+91 94140 12345", "email": "bhanwar.sons@gmail.com", "city": "Nagaur", "state": "Rajasthan", "addr": "Industrial Yard, Makrana", "cap": Decimal("35.0")},
            {"name": "Shree Cement Infra", "phone": "+91 98290 77665", "email": "infra@shreecement.com", "city": "Beawar", "state": "Rajasthan", "addr": "Cement Complex, Beawar", "cap": Decimal("75.0")},
        ]

        created_customers = {}
        for cdata in customers_seed:
            clean_phone = cdata["phone"].replace(" ", "").replace("+91", "")[-10:]
            existing = (await session.execute(select(Customer).where(Customer.phone == clean_phone))).scalar_one_or_none()
            if not existing:
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
                created_customers[cdata["name"]] = cust
            else:
                existing.name = cdata["name"]
                existing.email = cdata["email"]
                created_customers[cdata["name"]] = existing

        await session.flush()

        # 3. Solar Projects / Orders
        now = datetime.now(timezone.utc)
        projects_seed = [
            {"num": "SIMS-PRJ-1082", "cust": "Rajesh Sharma", "title": "Rooftop Solar 10.5kW", "amt": Decimal("485000.00"), "paid": Decimal("185000.00"), "status": OrderStatus.IN_PROGRESS, "days_ago": 3},
            {"num": "SIMS-PRJ-1081", "cust": "Apex Textiles Ltd.", "title": "Apex Textiles Solar Plant", "amt": Decimal("2250000.00"), "paid": Decimal("750000.00"), "status": OrderStatus.CONFIRMED, "days_ago": 4},
            {"num": "SIMS-PRJ-1080", "cust": "Priya Meena", "title": "Villa 42 Green Energy", "amt": Decimal("245000.00"), "paid": Decimal("245000.00"), "status": OrderStatus.COMPLETED, "days_ago": 5},
            {"num": "SIMS-PRJ-1079", "cust": "Golden Hospitality", "title": "Golden Palms Resort Solar", "amt": Decimal("1150000.00"), "paid": Decimal("150000.00"), "status": OrderStatus.IN_PROGRESS, "days_ago": 6},
            {"num": "SIMS-PRJ-1078", "cust": "Mukesh Choudhary", "title": "Kisan Cold Storage Rooftop", "amt": Decimal("1380000.00"), "paid": Decimal("320000.00"), "status": OrderStatus.IN_PROGRESS, "days_ago": 7},
            {"num": "SIMS-PRJ-1077", "cust": "Sunita Agarwal", "title": "Heritage Solar Retrofit", "amt": Decimal("390000.00"), "paid": Decimal("110000.00"), "status": OrderStatus.CONFIRMED, "days_ago": 8},
            {"num": "SIMS-PRJ-1076", "cust": "Modern Public School", "title": "Modern Public School Campus", "amt": Decimal("1840000.00"), "paid": Decimal("620000.00"), "status": OrderStatus.COMPLETED, "days_ago": 9},
            {"num": "SIMS-PRJ-1075", "cust": "Dr. Anand Saxena", "title": "Farmhouse Solar Microgrid", "amt": Decimal("560000.00"), "paid": Decimal("210000.00"), "status": OrderStatus.CONFIRMED, "days_ago": 10},
            {"num": "SIMS-PRJ-1074", "cust": "Shree Cement Infra", "title": "Shree Cement Employee Colony", "amt": Decimal("3450000.00"), "paid": Decimal("1250000.00"), "status": OrderStatus.COMPLETED, "days_ago": 11},
            {"num": "SIMS-PRJ-1073", "cust": "Bhanwar Lal & Sons", "title": "Marwar Marble Processing Yard", "amt": Decimal("1620000.00"), "paid": Decimal("450000.00"), "status": OrderStatus.CANCELLED, "days_ago": 12},
            {"num": "SIMS-PRJ-1071", "cust": "Kailash Yadav", "title": "Green Agrotech Polyhouse", "amt": Decimal("690000.00"), "paid": Decimal("140000.00"), "status": OrderStatus.IN_PROGRESS, "days_ago": 14},
        ]

        pkg = (await session.execute(select(Package).limit(1))).scalar_one()
        srv = (await session.execute(select(SiteSurvey).limit(1))).scalar_one()

        created_orders = {}
        for pdata in projects_seed:
            cust = created_customers.get(pdata["cust"])
            if not cust:
                continue

            order = (await session.execute(select(Order).where(Order.order_number == pdata["num"]))).scalar_one_or_none()
            if not order:
                order_date = now - timedelta(days=pdata["days_ago"])
                # Create a placeholder quotation
                quote = Quotation(
                    quotation_number=f"QT-DEMO-{pdata['num'].replace('SIMS-PRJ-', '')}",
                    customer_id=cust.id,
                    survey_id=srv.id,
                    package_id=pkg.id,
                    created_by_id=admin.id,
                    quotation_date=order_date - timedelta(days=2),
                    valid_until=order_date + timedelta(days=30),
                    subtotal=pdata["amt"],
                    discount=Decimal("0.00"),
                    tax_percentage=Decimal("18.00"),
                    tax_amount=Decimal("0.00"),
                    final_amount=pdata["amt"],
                    status=QuotationStatus.ACCEPTED,
                )
                session.add(quote)
                await session.flush()

                order = Order(
                    order_number=pdata["num"],
                    customer_id=cust.id,
                    quotation_id=quote.id,
                    order_date=order_date,
                    total_amount=pdata["amt"],
                    paid_amount=pdata["paid"],
                    outstanding_amount=pdata["amt"] - pdata["paid"],
                    order_status=pdata["status"],
                )
                session.add(order)
                await session.flush()

                # Add installation job
                job = InstallationJob(
                    job_number=f"JOB-{pdata['num'].replace('SIMS-PRJ-', '')}",
                    order_id=order.id,
                    customer_id=cust.id,
                    assigned_technician_id=tech1.id,
                    installation_status=InstallationStatus.COMPLETED if pdata["status"] == OrderStatus.COMPLETED else InstallationStatus.IN_PROGRESS,
                    scheduled_date=order_date + timedelta(days=2),
                )
                session.add(job)
            created_orders[pdata["num"]] = order

        await session.flush()

        # 4. Payments
        payments_seed = [
            {"num": "PAY-8921", "order": "SIMS-PRJ-1082", "amt": Decimal("185000.00"), "method": PaymentMethod.BANK_TRANSFER, "days_ago": 0},
            {"num": "PAY-8920", "order": "SIMS-PRJ-1081", "amt": Decimal("750000.00"), "method": PaymentMethod.BANK_TRANSFER, "days_ago": 1},
            {"num": "PAY-8919", "order": "SIMS-PRJ-1080", "amt": Decimal("95000.00"), "method": PaymentMethod.UPI, "days_ago": 2},
            {"num": "PAY-8918", "order": "SIMS-PRJ-1078", "amt": Decimal("320000.00"), "method": PaymentMethod.CHEQUE, "days_ago": 3},
            {"num": "PAY-8917", "order": "SIMS-PRJ-1079", "amt": Decimal("150000.00"), "method": PaymentMethod.BANK_TRANSFER, "days_ago": 4},
            {"num": "PAY-8916", "order": "SIMS-PRJ-1076", "amt": Decimal("620000.00"), "method": PaymentMethod.BANK_TRANSFER, "days_ago": 5},
            {"num": "PAY-8915", "order": "SIMS-PRJ-1071", "amt": Decimal("140000.00"), "method": PaymentMethod.UPI, "days_ago": 6},
            {"num": "PAY-8913", "order": "SIMS-PRJ-1074", "amt": Decimal("1250000.00"), "method": PaymentMethod.BANK_TRANSFER, "days_ago": 8},
            {"num": "PAY-8911", "order": "SIMS-PRJ-1075", "amt": Decimal("210000.00"), "method": PaymentMethod.BANK_TRANSFER, "days_ago": 10},
            {"num": "PAY-8910", "order": "SIMS-PRJ-1073", "amt": Decimal("450000.00"), "method": PaymentMethod.CHEQUE, "days_ago": 11},
            {"num": "PAY-8909", "order": "SIMS-PRJ-1077", "amt": Decimal("110000.00"), "method": PaymentMethod.UPI, "days_ago": 12},
        ]

        for paydata in payments_seed:
            ord_obj = created_orders.get(paydata["order"])
            if not ord_obj:
                continue

            existing_pay = (await session.execute(select(Payment).where(Payment.payment_number == paydata["num"]))).scalar_one_or_none()
            if not existing_pay:
                p = Payment(
                    payment_number=paydata["num"],
                    order_id=ord_obj.id,
                    amount=paydata["amt"],
                    payment_date=now - timedelta(days=paydata["days_ago"]),
                    payment_method=paydata["method"],
                    payment_type=PaymentType.ADVANCE,
                    payment_status=PaymentRecordStatus.VERIFIED,
                    recorded_by_id=admin.id,
                )
                session.add(p)

        await session.flush()

        # 5. Service Tickets
        tickets_seed = [
            {"num": "TCK-201", "cust": "Rajesh Sharma", "desc": "Inverter Grid Error 04 during afternoon peak", "status": TicketStatus.OPEN, "days_ago": 0},
            {"num": "TCK-200", "cust": "Mukesh Choudhary", "desc": "Low Generation Output on String 2", "status": TicketStatus.IN_PROGRESS, "days_ago": 1},
            {"num": "TCK-199", "cust": "Apex Textiles Ltd.", "desc": "Earthing & Lightning Surge Check needed", "status": TicketStatus.IN_PROGRESS, "days_ago": 2},
            {"num": "TCK-198", "cust": "Priya Meena", "desc": "Solar Monitoring App Offline / WiFi drop", "status": TicketStatus.RESOLVED, "days_ago": 3},
            {"num": "TCK-197", "cust": "Sunita Agarwal", "desc": "Net-Meter Discrepancy with DISCOM billing", "status": TicketStatus.CLOSED, "days_ago": 4},
            {"num": "TCK-196", "cust": "Golden Hospitality", "desc": "DC Isolator Tripping During High Noon Irradiation", "status": TicketStatus.OPEN, "days_ago": 5},
            {"num": "TCK-195", "cust": "Modern Public School", "desc": "Transformer Tapping Calibration required", "status": TicketStatus.IN_PROGRESS, "days_ago": 6},
            {"num": "TCK-191", "cust": "Kailash Yadav", "desc": "Annual Maintenance Contract Routine Inspection", "status": TicketStatus.CLOSED, "days_ago": 10},
        ]

        for tck in tickets_seed:
            cust = created_customers.get(tck["cust"])
            if not cust:
                continue

            existing_t = (await session.execute(select(ServiceTicket).where(ServiceTicket.ticket_number == tck["num"]))).scalar_one_or_none()
            if not existing_t:
                ticket = ServiceTicket(
                    ticket_number=tck["num"],
                    customer_id=cust.id,
                    complaint_description=tck["desc"],
                    assigned_technician_id=tech3.id,
                    ticket_creation_date=now - timedelta(days=tck["days_ago"]),
                    ticket_status=tck["status"],
                    is_under_warranty=True,
                )
                session.add(ticket)

        await session.flush()

        # 6. Audit Logs
        audit_seed = [
            {"action": "Generated and exported system operational report (PDF)", "entity": "Reports", "days": 0, "hours": 3},
            {"action": "Verified payment confirmation of ₹1,85,000 for Rajesh Sharma", "entity": "Payments", "days": 0, "hours": 7},
            {"action": "Approved bill of materials for Modern Public School (40kW)", "entity": "Orders", "days": 1, "hours": 2},
            {"action": "Updated stock buffer thresholds for 10kW Hybrid Inverters", "entity": "Inventory", "days": 2, "hours": 4},
            {"action": "Uploaded site survey shadow analysis report for Apex Textiles", "entity": "Surveys", "days": 2, "hours": 8},
            {"action": "Dispatched 24x 550W panels from Warehouse 1 to Sitapura site", "entity": "Dispatch", "days": 3, "hours": 5},
            {"action": "Generated quarterly GST 12% solar tax compliance ledger", "entity": "Finance", "days": 4, "hours": 2},
            {"action": "Completed drone 3D rooftop azimuth survey for Golden Hospitality", "entity": "Surveys", "days": 4, "hours": 9},
            {"action": "Approved technician clearance credentials for Vikram Singh", "entity": "Access Control", "days": 5, "hours": 6},
            {"action": "Commissioned 10kW On-Grid Inverter at Mansarovar, Jaipur", "entity": "Installations", "days": 6, "hours": 4},
            {"action": "Logged breakdown ticket TCK-201 for Arvind Verma", "entity": "Service Tickets", "days": 7, "hours": 1},
        ]

        # Clear existing audit logs to avoid duplicate confusion
        await session.execute(delete(AuditLog))
        for al in audit_seed:
            log_time = now - timedelta(days=al["days"], hours=al["hours"])
            audit = AuditLog(
                user_id=admin.id,
                action=al["action"],
                entity_type=al["entity"],
                created_at=log_time,
            )
            session.add(audit)

        # 7. Notifications
        notif_seed = [
            {"title": "Low Inventory: 10kW Hybrid Inverters", "msg": "Stock count has dropped to 2 units (Reorder threshold: 5 units).", "type": "Inventory"},
            {"title": "Payment Milestone Overdue (₹2.4 Lakh)", "msg": "Structure completion payment overdue for Sun Pharma Commercial Roof.", "type": "Payments"},
            {"title": "High Priority Service Ticket: Inverter Fault", "msg": "Customer Arvind Verma reported Grid Isolation Error on 5kW system.", "type": "Service Tickets"},
            {"title": "Delayed Installation: Project SIMS-PRJ-1044", "msg": "Installation at Sitapura Industrial Area delayed due to heavy rains.", "type": "Installations"},
            {"title": "Survey Approved: Apex Textiles 50kW", "msg": "Rooftop 3D azimuth analysis approved by senior engineering team.", "type": "Surveys"},
        ]

        await session.execute(delete(Notification))
        for n in notif_seed:
            notif = Notification(
                user_id=admin.id,
                title=n["title"],
                message=n["msg"],
                event_type=n["type"],
                is_read=False,
                created_at=now,
            )
            session.add(notif)

        await session.commit()
        print("✅ SunPower DB demo data successfully seeded!")


if __name__ == "__main__":
    asyncio.run(seed_all())
