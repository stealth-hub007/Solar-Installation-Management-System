# Solar Installation Management System (SIMS)

Enterprise-grade operations, sales pipeline tracking, inventory logistics, and customer lifecycle management platform tailored for rooftop solar installers and EPC contractors.

## Architecture & Modules

The platform is designed as a unified enterprise application with distinct operational roles and feature modules:

1. **Admin Dashboard (`/admin/*`)**: Core executive operations, products catalog, inventory stock adjustments, financial cash flows, user roles & verification requests, audit logs, and system settings.
2. **Sales Dashboard (`/sales/*`)**: Sales representative and commercial operations suite managing the complete customer acquisition and conversion lifecycle:
   - **Sales Overview & KPIs**: Total inquiries, new leads, converted deals, pending follow-ups, upcoming site surveys, quotations, accepted quotations, order tracking, monthly revenue, quota achievement.
   - **Customer Management (`/sales/customers`)**: KYC registration, profile 360 view, lead history, and commercial records.
   - **Enquiry Pipeline (`/sales/enquiries`)**: Inbound lead qualification, source attribution, capacity requirements, and stage transitions.
   - **Follow-up Management (`/sales/follow-ups`)**: Client outreach tracking across Phone Calls, WhatsApp, Meetings, Site Visits with reschedule and completion logging.
   - **Site Survey Management (`/sales/surveys`)**: Field technician dispatch, roof structural inspection, and shadow analysis scheduling.
   - **Quotation & BOQ Management (`/sales/quotations`)**: Live itemized bill of quantities (Panels, Inverter, Structure, BOS, Installation), MNRE PM Surya Ghar subsidy estimations, and contract generation.
   - **Order Tracking (`/sales/orders`)**: Purchase order milestone execution (Contract Signed $\rightarrow$ DISCOM Sanction $\rightarrow$ Material Staging $\rightarrow$ Installation $\rightarrow$ Net Metering Commissioning).

## Project Structure

```
Solar-managemenet-system/
├── frontend/                     # React 18 + Vite + Redux Toolkit + Tailwind CSS SPA
│   ├── docs/
│   │   └── SALES_API_CONTRACT.md # Complete FastAPI backend API specification
│   ├── src/
│   │   ├── app/                  # Central Redux store & React Router v6
│   │   ├── components/           # Reusable UI (DataTable, ConfirmDialog, Input, Select, etc.)
│   │   │   └── layout/           # AdminLayout, SalesLayout, SalesSidebar, SalesHeader
│   │   ├── features/
│   │   │   ├── admin/dashboard/  # Admin Dashboard Module
│   │   │   └── sales/            # Sales Dashboard Module
│   │   │       ├── pages/        # SalesDashboard, Customers, Enquiries, FollowUps, Surveys, Quotations, Orders
│   │   │       ├── components/   # Dashboard widgets, charts, and modal managers
│   │   │       ├── services/     # Axios API services (salesAPI, customerAPI, quotationAPI, etc.)
│   │   │       ├── slices/       # Redux Toolkit feature slices
│   │   │       └── utils/        # Constants, subsidy calculators, and form validators
│   │   └── services/             # Storage service engine & mock datasets
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── (backend/)                    # FastAPI + SQLAlchemy + PostgreSQL backend services
```

## Quick Start (Frontend)

```bash
cd frontend
npm install
npm run dev
```

### Production Build & Verification

```bash
cd frontend
npm run build
```
