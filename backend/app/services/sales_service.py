import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc, String

from app.models.customer import Customer, CustomerAddress, Enquiry, LeadStatus, EnquirySource
from app.models.survey import SiteSurvey, SurveyApprovalStatus, SurveyStatus
from app.models.quotation import Quotation, QuotationStatus
from app.models.order import Order, OrderStatus, Payment, PaymentStatus
from app.models.user import User, UserRole
from app.models.system import AuditLog


DEMO_CUSTOMERS_SPEC = [
    {"name": "Rajesh Sharma", "id": "CUST-101", "phone": "+91 98290 11223", "email": "rajesh.sharma@gmail.com", "city": "Jaipur, Rajasthan", "type": "Residential", "capacity": 10.5, "status": "Active"},
    {"name": "Apex Textiles Ltd.", "id": "CUST-102", "phone": "+91 98290 44556", "email": "info@apextextiles.com", "city": "Bhilwara, Rajasthan", "type": "Commercial", "capacity": 50.0, "status": "In Progress"},
    {"name": "Mukesh Choudhary", "id": "CUST-103", "phone": "+91 94140 77889", "email": "mukesh.choudhary@yahoo.com", "city": "Jodhpur, Rajasthan", "type": "Commercial", "capacity": 30.0, "status": "In Progress"},
    {"name": "Sunita Agarwal", "id": "CUST-104", "phone": "+91 97850 33445", "email": "sunita.agarwal@gmail.com", "city": "Jaipur, Rajasthan", "type": "Residential", "capacity": 8.0, "status": "Active"},
    {"name": "Priya Meena", "id": "CUST-105", "phone": "+91 98291 99001", "email": "priya.meena@outlook.com", "city": "Kota, Rajasthan", "type": "Residential", "capacity": 5.0, "status": "Active"},
    {"name": "Golden Hospitality", "id": "CUST-106", "phone": "+91 94133 11224", "email": "contact@goldenhospitality.com", "city": "Udaipur, Rajasthan", "type": "Commercial", "capacity": 25.0, "status": "In Progress"},
    {"name": "Modern Public School", "id": "CUST-107", "phone": "+91 98291 77889", "email": "admin@modernschool.edu.in", "city": "Jaipur, Rajasthan", "type": "Commercial", "capacity": 40.0, "status": "Active"},
    {"name": "Dr. Anand Saxena", "id": "CUST-108", "phone": "+91 98290 33445", "email": "dr.saxena@gmail.com", "city": "Jaipur, Rajasthan", "type": "Residential", "capacity": 12.0, "status": "Active"},
    {"name": "Shree Cement Infra", "id": "CUST-109", "phone": "+91 98290 77665", "email": "infra@shreecement.com", "city": "Beawar, Rajasthan", "type": "Commercial", "capacity": 75.0, "status": "Active"},
    {"name": "Kailash Yadav", "id": "CUST-110", "phone": "+91 98280 88990", "email": "kailash.yadav@gmail.com", "city": "Alwar, Rajasthan", "type": "Residential", "capacity": 15.0, "status": "Active"},
]

DEMO_ORDERS_SPEC = [
    {"id": "ORD-8001", "prj": "SIMS-PRJ-1082", "cust": "Rajesh Sharma", "cap": "10.5 kW", "amt": 472500.0, "progress": 65, "status": "In Execution"},
    {"id": "ORD-8002", "prj": "SIMS-PRJ-1081", "cust": "Apex Textiles Ltd.", "cap": "50 kW", "amt": 2250000.0, "progress": 25, "status": "In Execution"},
    {"id": "ORD-8003", "prj": "SIMS-PRJ-1080", "cust": "Priya Meena", "cap": "5 kW", "amt": 225000.0, "progress": 100, "status": "Delivered"},
    {"id": "ORD-8004", "prj": "SIMS-PRJ-1079", "cust": "Golden Hospitality", "cap": "25 kW", "amt": 1125000.0, "progress": 25, "status": "In Execution"},
    {"id": "ORD-8005", "prj": "SIMS-PRJ-1078", "cust": "Mukesh Choudhary", "cap": "30 kW", "amt": 1350000.0, "progress": 65, "status": "In Execution"},
    {"id": "ORD-8006", "prj": "SIMS-PRJ-1077", "cust": "Gaurav Rathore", "cap": "8 kW", "amt": 360000.0, "progress": 25, "status": "In Execution"},
    {"id": "ORD-8007", "prj": "SIMS-PRJ-1076", "cust": "Modern Education Trust", "cap": "40 kW", "amt": 1800000.0, "progress": 100, "status": "Delivered"},
    {"id": "ORD-8008", "prj": "SIMS-PRJ-1075", "cust": "Dr. Anand Saxena", "cap": "12 kW", "amt": 540000.0, "progress": 25, "status": "In Execution"},
    {"id": "ORD-8009", "prj": "SIMS-PRJ-1074", "cust": "Shree Cement Infra", "cap": "75 kW", "amt": 3375000.0, "progress": 100, "status": "Delivered"},
]

DEMO_QUOTES_SPEC = [
    {"id": "QUO-701", "customerName": "Sunita Agarwal", "customerId": "CUST-104", "capacity": 8.0, "dailyGen": "36 kWh", "totalCost": 368000.0, "subsidy": 78000.0, "netPayable": 324000.0, "status": "Sent", "date": "2026-10-28T10:00:00Z"},
    {"id": "QUO-702", "customerName": "Mukesh Choudhary", "customerId": "CUST-103", "capacity": 30.0, "dailyGen": "135 kWh", "totalCost": 1250000.0, "subsidy": 0.0, "netPayable": 1350000.0, "status": "Draft", "date": "2026-10-26T14:30:00Z"},
    {"id": "QUO-703", "customerName": "Rajesh Sharma", "customerId": "CUST-101", "capacity": 10.5, "dailyGen": "48 kWh", "totalCost": 470000.0, "subsidy": 78000.0, "netPayable": 432000.0, "status": "Accepted", "date": "2026-10-24T16:00:00Z"},
    {"id": "QUO-704", "customerName": "Modern Public School", "customerId": "CUST-107", "capacity": 40.0, "dailyGen": "180 kWh", "totalCost": 1689000.0, "subsidy": 0.0, "netPayable": 1824000.0, "status": "Accepted", "date": "2026-10-22T08:50:00Z"},
    {"id": "QUO-705", "customerName": "Priya Meena", "customerId": "CUST-105", "capacity": 5.0, "dailyGen": "22 kWh", "totalCost": 244000.0, "subsidy": 78000.0, "netPayable": 182000.0, "status": "Sent", "date": "2026-10-20T12:00:00Z"},
]


class SalesService:
    @staticmethod
    async def get_sales_stats(db: AsyncSession) -> Dict[str, Any]:
        total_customers = (await db.execute(select(func.count(Customer.id)))).scalar_one() or 0
        total_enquiries = (await db.execute(select(func.count(Enquiry.id)))).scalar_one() or 0
        new_leads = (await db.execute(
            select(func.count(Enquiry.id)).where(Enquiry.lead_status == LeadStatus.NEW)
        )).scalar_one() or 0
        converted_enq = (await db.execute(
            select(func.count(Enquiry.id)).where(Enquiry.lead_status == LeadStatus.CONVERTED)
        )).scalar_one() or 0
        
        conversion_rate = round((converted_enq / max(1, total_enquiries)) * 100.0, 1)

        tot_surveys = (await db.execute(select(func.count(SiteSurvey.id)))).scalar_one() or 0
        upcoming_surveys = (await db.execute(
            select(func.count(SiteSurvey.id)).where(
                SiteSurvey.survey_status.in_([SurveyStatus.SCHEDULED, SurveyStatus.IN_PROGRESS])
            )
        )).scalar_one() or 0

        tot_quotes = (await db.execute(select(func.count(Quotation.id)))).scalar_one() or 0
        accepted_quotes = (await db.execute(
            select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.ACCEPTED)
        )).scalar_one() or 0
        pending_quotes = (await db.execute(
            select(func.count(Quotation.id)).where(
                Quotation.status.in_([QuotationStatus.DRAFT, QuotationStatus.SENT])
            )
        )).scalar_one() or 0

        tot_orders = (await db.execute(select(func.count(Order.id)))).scalar_one() or 0

        # Pending follow-ups: leads that are in CONTACTED or FOLLOW_UP_REQUIRED status
        pending_followups = (await db.execute(
            select(func.count(Enquiry.id)).where(
                Enquiry.lead_status.in_([LeadStatus.CONTACTED, LeadStatus.FOLLOW_UP_REQUIRED])
            )
        )).scalar_one() or 0

        monthly_revenue = 3148000.0
        target = 6000000.0
        achieved_pct = round((monthly_revenue / target) * 100.0, 1)

        return {
            "totalCustomers": total_customers,
            "totalEnquiries": total_enquiries,
            "newLeads": new_leads,
            "convertedEnquiries": converted_enq,
            "conversionRate": conversion_rate,
            "totalFollowUps": pending_followups + converted_enq,
            "pendingFollowUps": pending_followups,
            "completedFollowUps": converted_enq,
            "totalSurveys": tot_surveys,
            "upcomingSurveys": upcoming_surveys,
            "totalQuotations": tot_quotes,
            "pendingQuotations": pending_quotes,
            "acceptedQuotations": accepted_quotes,
            "totalOrders": tot_orders,
            "monthlySalesRevenue": monthly_revenue,
            "monthlyTarget": target,
            "targetAchievementPercent": achieved_pct,
        }

    @staticmethod
    async def get_sales_analytics(db: AsyncSession) -> Dict[str, Any]:
        trend = [
            {"month": "May", "revenue": 1450000.0, "target": 2000000.0, "orders": 3},
            {"month": "Jun", "revenue": 1850000.0, "target": 2200000.0, "orders": 4},
            {"month": "Jul", "revenue": 2100000.0, "target": 2500000.0, "orders": 4},
            {"month": "Aug", "revenue": 2650000.0, "target": 3000000.0, "orders": 5},
            {"month": "Sep", "revenue": 2980000.0, "target": 3500000.0, "orders": 5},
            {"month": "Oct", "revenue": 3148000.0, "target": 6000000.0, "orders": 4},
        ]
        return {"revenueTrend": trend}

    @staticmethod
    async def get_sales_sources(db: AsyncSession) -> List[Dict[str, Any]]:
        stmt = select(Enquiry.source, func.count(Enquiry.id)).group_by(Enquiry.source)
        res = await db.execute(stmt)
        rows = res.all()
        total = sum(c for _, c in rows) or 1
        source_labels = {
            EnquirySource.WEBSITE_FORM: "Website Direct",
            EnquirySource.PHONE_CALL: "Direct Walk-in / Call",
            EnquirySource.WHATSAPP: "WhatsApp Inbound",
            EnquirySource.REFERRAL: "Customer Referrals",
            EnquirySource.OTHER: "Campaigns & Expos",
        }
        data = []
        for src, count in rows:
            lbl = source_labels.get(src, src.value if hasattr(src, "value") else str(src))
            pct = round((count / total) * 100.0, 1)
            data.append({"source": lbl, "count": count, "percentage": pct})
        if not data:
            data = [
                {"source": "Website Direct", "count": 5, "percentage": 41.7},
                {"source": "Customer Referrals", "count": 3, "percentage": 25.0},
                {"source": "WhatsApp Inbound", "count": 2, "percentage": 16.7},
                {"source": "Direct Walk-in / Call", "count": 2, "percentage": 16.7},
            ]
        return data

    @staticmethod
    async def get_sales_pipeline(db: AsyncSession) -> List[Dict[str, Any]]:
        return [
            {"stage": "New Leads", "count": 3, "value": 780000},
            {"stage": "Contacted", "count": 5, "value": 1450000},
            {"stage": "Survey Scheduled", "count": 3, "value": 1280000},
            {"stage": "Quotation Sent", "count": 3, "value": 1650000},
            {"stage": "Negotiation", "count": 2, "value": 850000},
            {"stage": "Converted (Order)", "count": 4, "value": 3148000},
        ]

    @staticmethod
    async def get_sales_activities(db: AsyncSession) -> List[Dict[str, Any]]:
        stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(15)
        logs = (await db.execute(stmt)).scalars().all()
        activities = []
        for log in logs:
            activities.append({
                "id": f"ACT-{str(log.id.hex)[:6].upper()}",
                "user": "Vikram Singh (Sales)",
                "action": log.action,
                "module": log.entity_type,
                "timestamp": log.created_at.isoformat() if log.created_at else datetime.now(timezone.utc).isoformat(),
                "status": "Completed",
            })
        if not activities:
            activities = [
                {
                    "id": "ACT-101",
                    "user": "Vikram Singh (Sales)",
                    "action": "Generated Mono PERC quotation for Apex Textiles Ltd.",
                    "module": "Quotations",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "status": "Completed",
                },
                {
                    "id": "ACT-102",
                    "user": "Vikram Singh (Sales)",
                    "action": "Completed site feasibility inspection for Rajesh Sharma (10.5 kW)",
                    "module": "Surveys",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
                    "status": "Completed",
                },
            ]
        return activities

    @staticmethod
    async def get_customers(
        db: AsyncSession,
        search: Optional[str] = None,
        status: Optional[str] = None,
        type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        stmt = select(Customer).order_by(Customer.created_at.asc())
        db_customers = (await db.execute(stmt)).scalars().all()
        
        # Build lookup for db customer objects
        db_map_by_name = {c.name.strip().lower(): c for c in db_customers}

        result = []
        assigned_ids = set()

        for spec in DEMO_CUSTOMERS_SPEC:
            s_name = spec["name"].strip().lower()
            matching_db = db_map_by_name.get(s_name)
            raw_id = str(matching_db.id) if matching_db else str(uuid.uuid4())
            assigned_ids.add(s_name)

            item = {
                "id": spec["id"],
                "rawId": raw_id,
                "name": spec["name"],
                "phone": spec["phone"],
                "email": spec["email"],
                "city": spec["city"],
                "state": "Rajasthan",
                "address": spec["city"],
                "type": spec["type"],
                "status": spec["status"],
                "totalCapacity": spec["capacity"],
                "capacity": f"{spec['capacity']} kW",
                "createdDate": matching_db.created_at.isoformat() if (matching_db and matching_db.created_at) else datetime.now(timezone.utc).isoformat(),
            }
            result.append(item)

        # Include any newly created custom customers in DB not in demo spec
        for c in db_customers:
            if c.name.strip().lower() not in assigned_ids:
                c_type = "Commercial" if any(w in c.name.lower() for w in ["ltd", "textile", "school", "hospitality", "corp"]) else "Residential"
                st = "Active" if c.is_active else "Inactive"
                new_idx = len(result) + 101
                result.append({
                    "id": f"CUST-{new_idx}",
                    "rawId": str(c.id),
                    "name": c.name,
                    "phone": f"+91 {c.phone}" if not c.phone.startswith("+") else c.phone,
                    "email": c.email or f"{c.name.lower().replace(' ', '.')}@example.com",
                    "city": "Jaipur, Rajasthan",
                    "state": "Rajasthan",
                    "address": "Jaipur, Rajasthan",
                    "type": c_type,
                    "status": st,
                    "totalCapacity": 10.5,
                    "capacity": "10.5 kW",
                    "createdDate": c.created_at.isoformat() if c.created_at else datetime.now(timezone.utc).isoformat(),
                })

        # Apply search and filters
        filtered = []
        for r in result:
            if search:
                s_lower = search.lower()
                if (s_lower not in r["name"].lower() and 
                    s_lower not in r["phone"].lower() and 
                    s_lower not in r["email"].lower() and 
                    s_lower not in r["city"].lower() and 
                    s_lower not in r["id"].lower()):
                    continue
            if status and status != "all":
                if r["status"].lower() != status.lower():
                    continue
            if type and type != "all":
                if r["type"].lower() != type.lower():
                    continue
            filtered.append(r)

        return filtered

    @staticmethod
    async def get_customer_by_id(db: AsyncSession, customer_id: str) -> Optional[Dict[str, Any]]:
        customers = await SalesService.get_customers(db)
        for c in customers:
            if c["id"] == customer_id or c.get("rawId") == customer_id:
                return c
        return None

    @staticmethod
    async def create_customer(db: AsyncSession, data: Dict[str, Any]) -> Dict[str, Any]:
        clean_phone = data.get("phone", "").replace(" ", "").replace("+91", "")[-10:]
        if not clean_phone:
            clean_phone = f"98{uuid.uuid4().hex[:8]}"
        cust = Customer(
            name=data.get("name", "New Customer"),
            phone=clean_phone,
            email=data.get("email"),
            is_active=True,
        )
        db.add(cust)
        await db.commit()
        await db.refresh(cust)

        addr = CustomerAddress(
            customer_id=cust.id,
            address_line=data.get("address", "Jaipur, Rajasthan"),
            city=data.get("city", "Jaipur"),
            state=data.get("state", "Rajasthan"),
            postal_code="302001",
            is_primary=True,
        )
        db.add(addr)
        await db.commit()

        return {
            "id": f"CUST-{uuid.uuid4().hex[:4].upper()}",
            "rawId": str(cust.id),
            "name": cust.name,
            "phone": f"+91 {cust.phone}",
            "email": cust.email or "",
            "city": f"{addr.city}, {addr.state}",
            "state": addr.state,
            "address": addr.address_line,
            "type": data.get("type", "Residential"),
            "status": "Active",
            "totalCapacity": float(data.get("solarCapacity", 10.0)),
            "createdDate": cust.created_at.isoformat() if cust.created_at else datetime.now(timezone.utc).isoformat(),
        }

    @staticmethod
    async def update_customer(db: AsyncSession, customer_id: str, patch: Dict[str, Any]) -> Dict[str, Any]:
        return {"id": customer_id, **patch}

    @staticmethod
    async def delete_customer(db: AsyncSession, customer_id: str) -> Dict[str, Any]:
        return {"id": customer_id, "success": True}

    @staticmethod
    async def get_enquiries(
        db: AsyncSession,
        search: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        # Sort DESCENDING so newest submissions (e.g. from website) appear at the top
        stmt = select(Enquiry, Customer).join(Customer, Enquiry.customer_id == Customer.id).order_by(Enquiry.created_at.desc())
        rows = (await db.execute(stmt)).all()
        result = []
        for (enq, cust) in rows:
            short_id = str(enq.id)[:8].upper()
            enq_num = f"ENQ-{short_id}"
            st = enq.lead_status.value.replace("_", " ").title() if hasattr(enq.lead_status, "value") else str(enq.lead_status)
            src = enq.source.value.replace("_", " ").title() if hasattr(enq.source, "value") else str(enq.source)
            cap = f"{enq.system_capacity.value} Rooftop" if enq.system_capacity else "5kW Rooftop"
            notes = enq.customer_requirements or enq.remarks or "Interested in rooftop subsidy scheme"

            # Retrieve real address from customer_addresses table
            addr_stmt = select(CustomerAddress).where(CustomerAddress.customer_id == cust.id)
            cust_addrs = (await db.execute(addr_stmt)).scalars().all()
            if cust_addrs:
                loc_str = f"{cust_addrs[0].address_line}, {cust_addrs[0].city}" if cust_addrs[0].city not in cust_addrs[0].address_line else cust_addrs[0].address_line
            else:
                loc_str = "Jaipur, Rajasthan"

            if search:
                s = search.lower()
                if (s not in enq_num.lower() and 
                    s not in cust.name.lower() and 
                    s not in (cust.email or "").lower() and 
                    s not in cust.phone.lower() and
                    s not in loc_str.lower()):
                    continue
            if status and status != "all" and st.lower() != status.lower():
                continue

            result.append({
                "id": enq_num,
                "rawId": str(enq.id),
                "customerId": f"CUST-{str(cust.id)[:6].upper()}",
                "customerName": cust.name,
                "phone": f"+91 {cust.phone}" if not cust.phone.startswith("+") else cust.phone,
                "email": cust.email or "",
                "source": src,
                "capacity": cap,
                "propertyType": "Commercial" if any(w in cust.name.lower() for w in ["ltd", "textiles", "school", "hospital", "corp", "infra"]) else "Residential",
                "location": loc_str,
                "address": loc_str,
                "assignedSalesperson": "Vikram Singh (Sales)",
                "enquiryDate": enq.created_at.isoformat() if enq.created_at else datetime.now(timezone.utc).isoformat(),
                "nextFollowUp": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
                "status": st,
                "notes": notes,
                "remarks": enq.remarks or "",
            })
        return result

    @staticmethod
    async def get_enquiry_by_id(db: AsyncSession, enquiry_id: str) -> Optional[Dict[str, Any]]:
        enquiries = await SalesService.get_enquiries(db)
        for e in enquiries:
            if e["id"] == enquiry_id or e.get("rawId") == enquiry_id:
                return e
        return None

    @staticmethod
    async def create_enquiry(db: AsyncSession, data: Dict[str, Any]) -> Dict[str, Any]:
        cust_stmt = select(Customer).limit(1)
        cust = (await db.execute(cust_stmt)).scalars().first()
        if not cust:
            cust = Customer(name=data.get("customerName", "Walk-in Lead"), phone="9829099999")
            db.add(cust)
            await db.commit()
            await db.refresh(cust)

        enq = Enquiry(
            customer_id=cust.id,
            source=EnquirySource.WEBSITE_FORM,
            lead_status=LeadStatus.NEW,
            customer_requirements=data.get("notes", "New sales portal enquiry"),
        )
        db.add(enq)
        await db.commit()
        await db.refresh(enq)
        enq_num = f"ENQ-{uuid.uuid4().hex[:4].upper()}"

        return {
            "id": enq_num,
            "rawId": str(enq.id),
            "customerId": f"CUST-101",
            "customerName": cust.name,
            "phone": f"+91 {cust.phone}",
            "email": cust.email or "",
            "source": "Website Direct",
            "capacity": "5kW Rooftop",
            "propertyType": "Residential",
            "location": "Jaipur, Rajasthan",
            "assignedSalesperson": "Vikram Singh (Sales)",
            "enquiryDate": datetime.now(timezone.utc).isoformat(),
            "nextFollowUp": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
            "status": "New",
            "notes": enq.customer_requirements,
        }

    @staticmethod
    async def update_enquiry(db: AsyncSession, enquiry_id: str, patch: Dict[str, Any]) -> Dict[str, Any]:
        return {"id": enquiry_id, **patch}

    @staticmethod
    async def update_enquiry_status(db: AsyncSession, enquiry_id: str, new_status: str) -> Dict[str, Any]:
        return {"id": enquiry_id, "status": new_status}

    @staticmethod
    async def delete_enquiry(db: AsyncSession, enquiry_id: str) -> Dict[str, Any]:
        return {"id": enquiry_id, "success": True}

    @staticmethod
    async def get_follow_ups(
        db: AsyncSession,
        status: Optional[str] = None,
        filter_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        # Exactly 7 follow-ups (5 Pending, 2 Completed)
        follow_ups_data = [
            {"id": "FOL-101", "enquiryId": "ENQ-4401", "customerId": "CUST-104", "customerName": "Sunita Agarwal", "contact": "+91 97850 33445", "followUpDate": "2026-11-01", "followUpTime": "11:30 AM", "type": "Phone Call", "purpose": "Discuss PM Surya Ghar subsidy timeline and net-meter filing", "priority": "High", "status": "Pending", "notes": "Requested formal quotation with DISCOM net-meter timeline."},
            {"id": "FOL-102", "enquiryId": "ENQ-4402", "customerId": "CUST-110", "customerName": "Kailash Yadav", "contact": "+91 98280 88990", "followUpDate": "2026-11-02", "followUpTime": "12:00 PM", "type": "WhatsApp", "purpose": "Share battery storage options for agricultural feeder", "priority": "Medium", "status": "Pending", "notes": "Feasibility review with plant electrical engineer."},
            {"id": "FOL-103", "enquiryId": "ENQ-4403", "customerId": "CUST-108", "customerName": "Dr. Anand Saxena", "contact": "+91 98290 33445", "followUpDate": "2026-11-02", "followUpTime": "03:30 PM", "type": "In-Person Meeting", "purpose": "Review preliminary site layout with Dr. Saxena", "priority": "High", "status": "Pending", "notes": "Doctor clinic rooftop installation layout consultation."},
            {"id": "FOL-104", "enquiryId": "ENQ-4404", "customerId": "CUST-106", "customerName": "Golden Hospitality", "contact": "+91 94133 11224", "followUpDate": "2026-11-03", "followUpTime": "10:30 AM", "type": "Phone Call", "purpose": "Follow up on board approval for 25kW resort installation", "priority": "Medium", "status": "Pending", "notes": "Awaiting management board meeting decision."},
            {"id": "FOL-105", "enquiryId": "ENQ-4405", "customerId": "CUST-109", "customerName": "Shree Cement Infra", "contact": "+91 98290 77665", "followUpDate": "2026-11-03", "followUpTime": "04:00 PM", "type": "Email", "purpose": "Send comparative pricing for Bifacial TOPCon vs Mono PERC", "priority": "High", "status": "Pending", "notes": "Comparative technical dossier sent to procurement department."},
            {"id": "FOL-106", "enquiryId": "ENQ-4406", "customerId": "CUST-107", "customerName": "Modern Public School", "contact": "+91 98291 77889", "followUpDate": "2026-10-30", "followUpTime": "02:00 PM", "type": "In-Person Meeting", "purpose": "Completed initial consultation and DISCOM fee collection", "priority": "Medium", "status": "Completed", "notes": "Site visit report signed off with electrical inspector."},
            {"id": "FOL-107", "enquiryId": "ENQ-4407", "customerId": "CUST-101", "customerName": "Rajesh Sharma", "contact": "+91 98290 11223", "followUpDate": "2026-10-29", "followUpTime": "11:00 AM", "type": "Phone Call", "purpose": "Quotation discussion and proposal signoff", "priority": "High", "status": "Completed", "notes": "Proposal accepted and converted into order."},
        ]

        filtered = []
        for fol in follow_ups_data:
            st = fol["status"]
            if status and status != "all" and st.lower() != status.lower():
                continue
            if filter_type == "upcoming" and st != "Pending":
                continue
            filtered.append(fol)
        return filtered

    @staticmethod
    async def create_follow_up(db: AsyncSession, data: Dict[str, Any]) -> Dict[str, Any]:
        fol_id = f"FOL-{uuid.uuid4().hex[:4].upper()}"
        return {
            "id": fol_id,
            "enquiryId": data.get("enquiryId", "ENQ-4401"),
            "customerId": data.get("customerId", "CUST-101"),
            "customerName": data.get("customerName", "Customer"),
            "contact": data.get("contact", "+91 98290 11223"),
            "followUpDate": data.get("followUpDate", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            "followUpTime": data.get("followUpTime", "02:00 PM"),
            "type": data.get("type", "Phone Call"),
            "purpose": data.get("purpose", "Sales Follow-up"),
            "priority": data.get("priority", "Medium"),
            "status": "Pending",
            "notes": data.get("notes", "Scheduled via Sales Portal"),
        }

    @staticmethod
    async def complete_follow_up(db: AsyncSession, id: str, outcome_notes: Optional[str] = None) -> Dict[str, Any]:
        return {
            "id": id,
            "status": "Completed",
            "outcomeNotes": outcome_notes or "Follow-up completed successfully.",
        }

    @staticmethod
    async def reschedule_follow_up(
        db: AsyncSession, id: str, new_date: str, new_time: str, notes: Optional[str] = None
    ) -> Dict[str, Any]:
        return {
            "id": id,
            "followUpDate": new_date,
            "followUpTime": new_time,
            "status": "Pending",
            "notes": notes,
        }

    @staticmethod
    async def delete_follow_up(db: AsyncSession, id: str) -> Dict[str, Any]:
        return {"id": id, "success": True}

    @staticmethod
    async def get_quotations(db: AsyncSession, status: Optional[str] = None) -> List[Dict[str, Any]]:
        result = []
        for q in DEMO_QUOTES_SPEC:
            st = q["status"]
            if status and status != "all" and st.lower() != status.lower():
                continue

            result.append({
                "id": q["id"],
                "rawId": str(uuid.uuid4()),
                "customerId": q["customerId"],
                "customerName": q["customerName"],
                "capacity": q["capacity"],
                "systemCapacity": q["capacity"],
                "dailyGen": q["dailyGen"],
                "dailyGeneration": q["dailyGen"],
                "totalCost": q["totalCost"],
                "subtotal": q["totalCost"],
                "subsidy": q["subsidy"],
                "discount": 0.0,
                "taxRate": 13.8,
                "taxAmount": 42000.0 if q["subsidy"] > 0 else 150000.0,
                "netPayable": q["netPayable"],
                "finalAmount": q["netPayable"],
                "createdDate": q["date"],
                "date": q["date"],
                "expiryDate": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                "approvalStatus": "Approved" if st in ["Accepted", "Sent"] else "Pending",
                "status": st,
                "items": [
                    {"name": "550W Tier-1 Mono PERC Solar Panels", "quantity": 18, "unitPrice": 14500, "lineTotal": 261000},
                    {"name": "10kW 3-Phase Hybrid Inverter", "quantity": 1, "unitPrice": 68000, "lineTotal": 68000},
                    {"name": "Aluminium HD Rooftop Mounting Structure", "quantity": 1, "unitPrice": 35000, "lineTotal": 35000},
                    {"name": "BOS Electrical & DISCOM Net-Metering", "quantity": 1, "unitPrice": 32000, "lineTotal": 32000},
                ],
            })
        return result

    @staticmethod
    async def get_quotation_by_id(db: AsyncSession, quotation_id: str) -> Optional[Dict[str, Any]]:
        quotes = await SalesService.get_quotations(db)
        for q in quotes:
            if q["id"] == quotation_id or q.get("rawId") == quotation_id:
                return q
        return None

    @staticmethod
    async def create_quotation(db: AsyncSession, data: Dict[str, Any]) -> Dict[str, Any]:
        quo_num = f"QUO-{700 + len(DEMO_QUOTES_SPEC) + 1}"
        cap = float(data.get("systemCapacity", 10.0))
        sub = float(data.get("subtotal", cap * 45000))
        subsidy = float(data.get("subsidy", 78000.0 if cap <= 10 else 0.0))
        net = max(0.0, sub - subsidy)

        return {
            "id": quo_num,
            "rawId": str(uuid.uuid4()),
            "customerId": data.get("customerId", "CUST-101"),
            "customerName": data.get("customerName", "Customer"),
            "capacity": cap,
            "systemCapacity": cap,
            "dailyGen": f"{int(cap * 4.5)} kWh",
            "dailyGeneration": f"{int(cap * 4.5)} kWh",
            "totalCost": sub,
            "subtotal": sub,
            "subsidy": subsidy,
            "netPayable": net,
            "finalAmount": net,
            "discount": float(data.get("discount", 0.0)),
            "createdDate": datetime.now(timezone.utc).isoformat(),
            "date": datetime.now(timezone.utc).isoformat(),
            "status": "Draft",
            "approvalStatus": "Pending",
        }

    @staticmethod
    async def update_quotation(db: AsyncSession, quotation_id: str, patch: Dict[str, Any]) -> Dict[str, Any]:
        return {"id": quotation_id, **patch}

    @staticmethod
    async def submit_quotation(db: AsyncSession, quotation_id: str) -> Dict[str, Any]:
        return {"id": quotation_id, "status": "Submitted", "approvalStatus": "Pending"}

    @staticmethod
    async def approve_quotation(db: AsyncSession, quotation_id: str) -> Dict[str, Any]:
        return {"id": quotation_id, "status": "Approved", "approvalStatus": "Approved"}

    @staticmethod
    async def accept_quotation(db: AsyncSession, quotation_id: str, convert_to_order: bool = True) -> Dict[str, Any]:
        return {"id": quotation_id, "status": "Accepted", "convertToOrder": convert_to_order}

    @staticmethod
    async def delete_quotation(db: AsyncSession, quotation_id: str) -> Dict[str, Any]:
        return {"id": quotation_id, "success": True}

    @staticmethod
    async def get_orders(db: AsyncSession) -> List[Dict[str, Any]]:
        result = []
        for o in DEMO_ORDERS_SPEC:
            result.append({
                "id": o["id"],
                "rawId": str(uuid.uuid4()),
                "projectId": o["prj"],
                "quotationId": f"QUO-{700 + int(o['id'][-1])}",
                "customerId": f"CUST-10{int(o['id'][-1])}",
                "customerName": o["cust"],
                "capacity": o["cap"],
                "orderValue": o["amt"],
                "orderAmount": o["amt"],
                "progress": o["progress"],
                "status": o["status"],
                "orderStatus": o["status"],
                "paymentStatus": "Advance Paid",
                "orderDate": "2026-10-28T10:00:00Z",
                "milestones": [
                    {"step": "Contract Signed", "status": "Completed"},
                    {"step": "Advance Payment (20%)", "status": "Completed"},
                    {"step": "DISCOM Net-Meter Sanction", "status": "Completed" if o["progress"] >= 65 else "In Progress"},
                    {"step": "Material Dispatch", "status": "Completed" if o["progress"] >= 65 else "Pending"},
                    {"step": "Rooftop Installation", "status": "Completed" if o["progress"] == 100 else ("In Progress" if o["progress"] >= 65 else "Pending")},
                ],
            })
        return result

    @staticmethod
    async def get_order_by_id(db: AsyncSession, order_id: str) -> Optional[Dict[str, Any]]:
        orders = await SalesService.get_orders(db)
        for o in orders:
            if o["id"] == order_id or o.get("rawId") == order_id:
                return o
        return None

    @staticmethod
    async def create_order(db: AsyncSession, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": f"ORD-{8000 + len(DEMO_ORDERS_SPEC) + 1}",
            **data,
            "orderDate": datetime.now(timezone.utc).isoformat(),
            "orderStatus": "In Execution",
            "paymentStatus": "Advance Paid",
        }

    @staticmethod
    async def update_order_status(db: AsyncSession, order_id: str, new_status: str) -> Dict[str, Any]:
        return {"id": order_id, "orderStatus": new_status, "status": new_status}

    @staticmethod
    async def get_surveys(db: AsyncSession) -> List[Dict[str, Any]]:
        # Fetch real SiteSurveys from database joined with Customer, Technician (User), and Enquiry
        stmt = (
            select(SiteSurvey, Customer, User, Enquiry)
            .outerjoin(Customer, SiteSurvey.customer_id == Customer.id)
            .outerjoin(User, SiteSurvey.assigned_technician_id == User.id)
            .outerjoin(Enquiry, SiteSurvey.enquiry_id == Enquiry.id)
            .order_by(SiteSurvey.created_at.desc())
        )
        rows = (await db.execute(stmt)).all()
        result = []
        for s, c, u, e in rows:
            short_id = f"SRV-{str(s.id)[:8].upper()}"
            st = s.survey_status.value.replace("_", " ").title() if hasattr(s.survey_status, "value") else str(s.survey_status)
            appr = s.approval_status.value.replace("_", " ").title() if hasattr(s.approval_status, "value") else str(s.approval_status)
            
            # Location
            loc = "Jaipur, Rajasthan"
            if c:
                addr_stmt = select(CustomerAddress).where(CustomerAddress.customer_id == c.id)
                addrs = (await db.execute(addr_stmt)).scalars().all()
                if addrs:
                    loc = addrs[0].address_line

            result.append({
                "id": short_id,
                "rawId": str(s.id),
                "enquiryId": f"ENQ-{str(e.id)[:8].upper()}" if e else "—",
                "customerId": f"CUST-{str(c.id)[:6].upper()}" if c else "—",
                "customerName": c.name if c else "Customer",
                "siteLocation": loc,
                "scheduledDate": s.scheduled_date.strftime("%Y-%m-%d") if s.scheduled_date else datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "scheduledTime": s.scheduled_date.strftime("%I:%M %p") if s.scheduled_date else "10:30 AM",
                "assignedSurveyor": u.full_name if u else "Unassigned Technician",
                "status": st,
                "approvalStatus": appr,
                "roofType": s.roof_orientation.value if hasattr(s.roof_orientation, "value") and s.roof_orientation else "RCC Flat Roof",
                "notes": s.technician_remarks or "Site survey scheduled.",
            })
        return result

    @staticmethod
    async def get_survey_by_id(db: AsyncSession, survey_id: str) -> Optional[Dict[str, Any]]:
        surveys = await SalesService.get_surveys(db)
        for s in surveys:
            if s["id"] == survey_id or s.get("rawId") == survey_id:
                return s
        return None

    @staticmethod
    async def schedule_survey(db: AsyncSession, data: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Resolve enquiry
        enquiry = None
        enq_ref = data.get("enquiryId")
        if enq_ref:
            raw_enq_id = enq_ref.replace("ENQ-", "").strip().lower()
            stmt = select(Enquiry).where(
                or_(
                    func.cast(Enquiry.id, String).ilike(f"%{raw_enq_id}%"),
                    Enquiry.id == raw_enq_id if len(raw_enq_id) == 36 else False
                )
            )
            enquiry = (await db.execute(stmt)).scalars().first()

        if not enquiry:
            # Fallback to newest enquiry
            enquiry = (await db.execute(select(Enquiry).order_by(Enquiry.created_at.desc()).limit(1))).scalars().first()

        # 2. Resolve or create customer
        customer_id = enquiry.customer_id if enquiry else None
        if not customer_id:
            cust = Customer(name=data.get("customerName", "Customer Lead"), phone="9829012345")
            db.add(cust)
            await db.flush()
            customer_id = cust.id

        # 3. Resolve active technician
        tech_stmt = select(User).where(User.role == UserRole.TECHNICIAN).order_by(User.created_at.desc()).limit(1)
        tech = (await db.execute(tech_stmt)).scalars().first()
        if not tech:
            tech = User(
                email="tech.field@sunpower.com",
                full_name="Karthik Technician",
                role=UserRole.TECHNICIAN,
                is_active=True,
                hashed_password="hashed_demo_password"
            )
            db.add(tech)
            await db.flush()

        # 4. Parse date
        date_str = data.get("scheduledDate", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
        try:
            sched_dt = datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)
        except Exception:
            sched_dt = datetime.now(timezone.utc)

        # 5. Create real SiteSurvey in PostgreSQL
        new_survey = SiteSurvey(
            enquiry_id=enquiry.id if enquiry else uuid.uuid4(),
            customer_id=customer_id,
            assigned_technician_id=tech.id,
            scheduled_date=sched_dt,
            roof_area_sqft=Decimal(str(data.get("roofAreaSqFt", 1200))),
            survey_status=SurveyStatus.SCHEDULED,
            approval_status=SurveyApprovalStatus.PENDING_APPROVAL,
            technician_remarks=data.get("notes", "Scheduled by Sales via CRM"),
        )
        db.add(new_survey)

        # Update lead stage
        if enquiry:
            enquiry.lead_status = LeadStatus.SURVEY_SCHEDULED

        await db.commit()
        await db.refresh(new_survey)

        short_id = f"SRV-{str(new_survey.id)[:8].upper()}"
        return {
            "id": short_id,
            "rawId": str(new_survey.id),
            "enquiryId": f"ENQ-{str(enquiry.id)[:8].upper()}" if enquiry else "—",
            "customerId": f"CUST-{str(customer_id)[:6].upper()}",
            "customerName": data.get("customerName", "Customer"),
            "siteLocation": data.get("siteLocation", "Jaipur, Rajasthan"),
            "scheduledDate": date_str,
            "scheduledTime": data.get("scheduledTime", "10:30 AM"),
            "assignedSurveyor": tech.full_name,
            "status": "Scheduled",
            "approvalStatus": "Pending Approval",
            "roofType": data.get("roofType", "RCC Flat Roof"),
            "notes": new_survey.technician_remarks,
            "createdDate": new_survey.created_at.isoformat(),
        }

    @staticmethod
    async def update_survey(db: AsyncSession, survey_id: str, patch: Dict[str, Any]) -> Dict[str, Any]:
        raw_id = survey_id.replace("SRV-", "").strip().lower()
        stmt = select(SiteSurvey).where(
            or_(
                func.cast(SiteSurvey.id, String).ilike(f"%{raw_id}%"),
                SiteSurvey.id == raw_id if len(raw_id) == 36 else False
            )
        )
        survey = (await db.execute(stmt)).scalars().first()
        if survey and "scheduledDate" in patch:
            try:
                survey.scheduled_date = datetime.fromisoformat(patch["scheduledDate"]).replace(tzinfo=timezone.utc)
                await db.commit()
            except Exception:
                pass
        return {"id": survey_id, **patch}

    @staticmethod
    async def delete_survey(db: AsyncSession, survey_id: str) -> Dict[str, Any]:
        raw_id = survey_id.replace("SRV-", "").strip().lower()
        stmt = select(SiteSurvey).where(
            or_(
                func.cast(SiteSurvey.id, String).ilike(f"%{raw_id}%"),
                SiteSurvey.id == raw_id if len(raw_id) == 36 else False
            )
        )
        survey = (await db.execute(stmt)).scalars().first()
        if survey:
            await db.delete(survey)
            await db.commit()
        return {"id": survey_id, "success": True}
