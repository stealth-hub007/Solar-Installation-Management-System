# SIMS Architecture: Dual Frontend Applications & Shared Backend

## System Overview

```text
                                  +--------------------------------------------------+
                                  |                 Client Browsers                  |
                                  +--------------------------------------------------+
                                           |                                |
                       Public Visitors     |                                | Internal Staff
                   (Explore & Submit Lead) |                                | (Admin, Sales, Warehouse, Tech)
                                           v                                v
                     +---------------------------+            +---------------------------+
                     |    SIMS Public Website    |            |         SIMS CRM          |
                     |   http://localhost:3001   |            |   http://localhost:3000   |
                     |   (React 18 + Vite SPA)   |            |   (React 18 + Vite SPA)   |
                     +---------------------------+            +---------------------------+
                                   |                                        |
                 POST /v1/enquiries/public                                  | Authenticated REST / JWT
                 (No employee credentials)                                  | Role-based authorization
                                   |                                        |
                                   +-------------------+--------------------+
                                                       |
                                                       v
                                    +-------------------------------------+
                                    |        Shared FastAPI Backend       |
                                    |        http://localhost:8000        |
                                    |         (Python 3.12 Asynchronous)  |
                                    +-------------------------------------+
                                                       |
                                                       | SQLAlchemy 2.0 Async
                                                       v
                                    +-------------------------------------+
                                    |         PostgreSQL Database         |
                                    |            sunpower_db              |
                                    |       Port 5432 (Single Source)     |
                                    +-------------------------------------+
```

---

## 1. Application 1: SIMS CRM (`frontend/`)

- **Local URL**: `http://localhost:3000`
- **Purpose**: Internal business operations for company employees.
- **Portals**:
  - `/admin/*`: Master KPI oversight, user approvals, role assignments, financial audits.
  - `/sales/*`: Leads & enquiries management, pipeline stages, customer profiles, quotation generation.
  - `/warehouse/*`: Real-time stock counts, purchase orders, goods receipt notes (GRN), dispatches.
  - `/technician/*`: My tasks, assigned site surveys, mobile checklists, digital commissioning.
- **Authentication**: JWT Bearer token authentication + Google OAuth 2.0.
  - Public registration assigns `PENDING` status.
  - Admin approves and assigns roles via `/admin/users`.

---

## 2. Application 2: SIMS Public Website (`website-frontend/`)

- **Local URL**: `http://localhost:3001`
- **Purpose**: Public-facing marketing website for solar customers.
- **Theme**: Enterprise Light Blue (`#0284C7`) and Crisp White (`#FFFFFF`).
- **Pages**:
  - `/`: Home (Hero, Solar Metrics, Solutions, 4-step installation workflow, CTA)
  - `/about`: Company background, engineering standards, mission, tier-1 partnerships.
  - `/services`: Residential, Commercial, Industrial, Battery Hybrid, and Solar AMC.
  - `/contact`: Interactive quotation request form with real-time validation and city/capacity selector.
- **Security & Navigation**:
  - No employee login or internal dashboards exposed to visitors.
  - Discreet "Employee Login" link in footer pointing to `http://localhost:3000/login`.
  - Honeypot bot protection and input sanitization on public contact form.

---

## 3. Shared FastAPI Backend (`backend/`)

- **Local URL**: `http://localhost:8000`
- **CORS Allowed Origins**:
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `http://127.0.0.1:3000`
  - `http://127.0.0.1:3001`
- **Public Website Enquiry Ingestion**:
  - Endpoint: `POST /api/v1/enquiries/public`
  - Saves customer record in `customers` table and enquiry record in `enquiries` table with `source = EnquirySource.WEBSITE_FORM`.
  - Dispatches immediate in-app alert to Admin and Sales users.
  - Automatically available on the Sales CRM dashboard (`/sales/enquiries`) for lead assignment and follow-up.

