# ☀️ SunPower Solutions — Solar Installation Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0_(Async)-D71F00.svg?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2.9-E92063.svg?style=flat&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![Alembic](https://img.shields.io/badge/Alembic-Migrations-8A2BE2.svg?style=flat)](https://alembic.sqlalchemy.org/)
[![Pytest](https://img.shields.io/badge/Pytest-Async_Tests_Passing-brightgreen.svg?style=flat&logo=pytest&logoColor=white)](https://docs.pytest.org/)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg?style=flat)](#license)

> **Enterprise-grade, Production-ready Solar Installation Management System** designed to manage and automate the full business lifecycle for residential and commercial rooftop solar installations (1 kW to 5 kW On-Grid & Off-Grid).

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [End-to-End Business Lifecycle](#-end-to-end-business-lifecycle)
- [Key Business Problems Solved](#-key-business-problems-solved)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Technology Stack](#-technology-stack)
- [Repository Architecture](#-repository-architecture)
- [Quick Start Guide](#-quick-start-guide)
- [Default Admin Credentials & Seed Data](#-default-admin-credentials--seed-data)
- [Interactive API Documentation](#-interactive-api-documentation)
- [Automated Testing](#-automated-testing)
- [Postman Collection](#-postman-collection)
- [License](#-license)

---

## 🌟 Project Overview

**SunPower Solutions** operates at a scale of **40+ rooftop solar projects per month** with **15 field technicians**, handling systems from **1 kW to 5 kW** in both **On-Grid** and **Off-Grid** topologies.

Before this centralized platform, solar installers faced fragmented operations: enquiries lost across WhatsApp chats and phone calls, manual paper quotations missing critical safety switches, loose serial numbers on paper cards, photo surveys scattered across technician phones, difficult warranty lookups, and inability to calculate real project-level profitability.

This centralized backend eliminates these bottlenecks by enforcing strict relational state machines, financial validations, hardware serial tracing, automated document generation, and project profitability analytics.

---

## 🔄 End-to-End Business Lifecycle

```text
  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
  │ Customer Enquiry│ ────> │   Site Survey   │ ────> │ Admin Approval  │
  │ (WhatsApp/Web)  │       │ (Measurements)  │       │  (Strict Gate)  │
  └─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                               │
  ┌─────────────────┐       ┌─────────────────┐       ┌────────▼────────┐
  │ Inventory Stock │ <──── │ Order Confirmed │ <──── │ Quotation Engine│
  │   Reservation   │       │ (20% Advance)   │       │(ReportLab PDF)  │
  └────────┬────────┘       └─────────────────┘       └─────────────────┘
           │
  ┌────────▼────────┐       ┌─────────────────┐       ┌─────────────────┐
  │ Dispatch Challan│ ────> │ Delivery Confirm│ ────> │ Auto-Generated  │
  │(Serial Tracking)│       │  & Handover     │       │  Warranties     │
  └─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                               │
  ┌─────────────────┐       ┌─────────────────┐       ┌────────▼────────┐
  │ Project Profit  │ <──── │ After-Sales Svc │ <──── │ 7-Point Safety  │
  │ & Executive KPI │       │(Warranty-Aware) │       │ Testing & Signoff│
  └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 🎯 Key Business Problems Solved

1. **Enquiry & Lead Capture:** Ingests leads from WhatsApp, phone calls, and web forms. Tracks status (`New` ➔ `Contacted` ➔ `Survey Scheduled` ➔ `Converted`) and alerts sales reps of pending follow-ups.
2. **The Site Survey Approval Gate:** Strictly blocks quotation generation until an Admin evaluates and approves the technician's roof measurements, shadow analysis, and structural suitability.
3. **Automated Bill of Materials (BOM):** Pre-configured 1 kW to 5 kW On-Grid and Off-Grid packages ensure zero missing components (switches, earthing kits, cables, distribution boxes).
4. **ReportLab Document Engine:** Generates downloadable, high-resolution PDF Quotations and Payment Receipts with company headers, itemized breakdowns, GST calculations, and bank payment instructions.
5. **Hardware Serial Number Barcode Tracking:** Serialized tracking for high-value assets (Solar Panels, Inverters, Batteries) through warehouse intake, reservation, and vehicle dispatch.
6. **Automated Warranty Certificate Generation:** Confirming delivery automatically issues unique, tamper-proof warranty certificates linked to equipment serials.
7. **7-Point Installation Safety Checklist:** Technicians must verify mounting torque, tilt angle, DC conduits, inverter ventilation, earthing resistance (< 5Ω), and grid synchronization before capturing customer digital signatures.
8. **Warranty-Aware Service Tickets:** After-sales tickets check equipment warranty coverage in real-time. Active warranties default customer service charges to **₹0.00**.
9. **Project-Level Profitability Engine:** Real-time financial reports calculate:
   $$\text{Net Profit} = \text{Order Revenue} - (\text{Material Cost} + \text{Direct Expenses} + \text{Warranty Costs})$$

---

## 👥 Role-Based Access Control (RBAC)

The system enforces strict role-based authorization using dependency injection across 4 core personas:

| Role | Responsibilities & Access Permissions |
|---|---|
| 👑 **Admin / Management** | Full system governance: User management, survey approvals, package pricing, order overrides, project expense tracking, financial reports, and executive KPI dashboard. |
| 💼 **Sales Executive** | Lead capture, customer onboarding, scheduling site surveys, generating quotations (post-survey approval), managing client acceptance, and recording payments. |
| 🔧 **Field Technician** | Viewing assigned surveys, recording roof measurements, uploading site photographs, completing the 7-point commissioning checklist, logging electrical test results, capturing customer digital sign-offs, and resolving service tickets. |
| 📦 **Warehouse Manager** | Stock overview, inward/outward adjustments, serial number registration, barcode scanning/verification, dispatch challan generation, and delivery confirmation. |

---

## 🛠️ Technology Stack

| Layer | Technology | Specification / Purpose |
|---|---|---|
| **Programming Language** | Python 3.11+ | Modern type annotations, async/await runtime |
| **Web Framework** | FastAPI 0.115+ | High-performance asynchronous REST API framework |
| **Relational Database** | PostgreSQL 15+ | Enterprise ACID-compliant relational storage |
| **ORM** | SQLAlchemy 2.0 | Async Engine, `Mapped`, `mapped_column`, typed declarative mappings |
| **Data Validation** | Pydantic v2 | High-speed C-based schema validation and Settings management |
| **Database Migrations** | Alembic | Fully asynchronous schema migration pipeline |
| **Authentication & RBAC** | JWT & Passlib | Bcrypt hashing, OAuth2 Bearer access & refresh tokens |
| **Document Generation** | ReportLab | Programmatic PDF generation for Quotations and Receipts |
| **Testing Engine** | Pytest & Pytest-Asyncio | 100% async test suite with isolated test database |
| **Documentation** | Swagger UI & ReDoc | Interactive OpenAPI 3.1 live documentation |

---

## 📁 Repository Architecture

```text
.
├── .gitignore                      # Root Git ignore rules (protects .env, .venv, uploads)
├── README.md                       # Main repository guide (this file)
└── backend/                        # Dedicated Backend Modular Monolith
    ├── alembic/                    # Async database migration versions
    │   ├── env.py                  # Migration runner configuration
    │   └── versions/               # 39 relational tables migration scripts
    ├── app/
    │   ├── main.py                 # FastAPI app entry point, CORS, and route registrations
    │   ├── core/                   # App config, async engine, security, seeder, exceptions
    │   ├── models/                 # SQLAlchemy 2.0 ORM models (39 tables)
    │   ├── schemas/                # Pydantic v2 request/response schemas
    │   ├── services/               # Business logic and multi-table transactions
    │   ├── routes/                 # 21 REST endpoint controller modules
    │   ├── dependencies/           # Auth and RBAC guards
    │   └── utils/                  # ReportLab PDF generators and upload handlers
    ├── tests/                      # Automated async Pytest test suite (20 tests)
    ├── uploads/                    # Local storage (surveys, installations, signatures)
    ├── postman_collection.json     # Complete Postman Collection for all 21 modules
    ├── database_setup.sql          # PostgreSQL setup script
    ├── requirements.txt            # Locked production dependencies
    └── README.md                   # Backend technical specifications & guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.11+** installed
- **PostgreSQL 15+** running locally or via Docker

### 2. Database Creation
Create the development and test databases in PostgreSQL:
```sql
CREATE DATABASE sunpower_db;
CREATE DATABASE sunpower_test_db;
```

### 3. Setup Virtual Environment
Navigate to the `backend/` directory:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your database credentials and secrets are configured:
```env
PROJECT_NAME="SunPower Solutions"
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/sunpower_db"
JWT_SECRET_KEY="sunpower-super-secret-jwt-key-replace-in-production"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=120
REFRESH_TOKEN_EXPIRE_DAYS=7
UPLOAD_DIR="uploads"
MAX_UPLOAD_SIZE_MB=10
```

### 5. Apply Database Migrations
Run Alembic to create all 39 tables:
```bash
alembic upgrade head
```

### 6. Start the Backend Server
Launch the Uvicorn server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🔐 Default Admin Credentials & Seed Data

On startup, the system automatically checks and seeds the database with:
- **Default Administrator Account:**
  - **Email:** `admin@sunpower.com`
  - **Password:** `Admin@12345Password`
- **Product Catalog:** Solar panels (540W Mono-PERC), inverters (3kW/5kW On-Grid & Hybrid), batteries (150Ah Tubular), charge controllers, mounting structures, and earthing kits.
- **Pre-configured Solar Packages:** 1 kW, 2 kW, 3 kW, 4 kW, and 5 kW On-Grid & Off-Grid packages with exact bills of materials.

---

## 📖 Interactive API Documentation

Once the server is running, explore and test the endpoints directly in your browser:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs) (or [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs))
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check & DB Ping:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🧪 Automated Testing

The backend includes a comprehensive async integration test suite covering RBAC, survey blocking rules, quotation-to-order conversions, automatic warranty creation, and project profitability calculations.

Run the test suite:
```bash
cd backend
.venv/bin/pytest -v
```

### Test Results:
```text
tests/test_auth.py::test_admin_login_success PASSED                      [  5%]
tests/test_auth.py::test_login_invalid_password PASSED                   [ 10%]
tests/test_auth.py::test_refresh_token_flow PASSED                       [ 15%]
tests/test_auth.py::test_get_current_user_profile PASSED                 [ 20%]
tests/test_auth.py::test_update_profile PASSED                           [ 25%]
tests/test_auth.py::test_password_reset_with_otp_flow PASSED             [ 30%]
tests/test_customers_enquiries.py::test_customer_lifecycle PASSED        [ 35%]
tests/test_customers_enquiries.py::test_enquiry_lifecycle_and_followups PASSED [ 40%]
tests/test_health.py::test_root_endpoint PASSED                          [ 45%]
tests/test_health.py::test_health_check_endpoint PASSED                  [ 50%]
tests/test_installations_services_finance.py::test_installation_service_tickets_and_finance_flow PASSED [ 55%]
tests/test_inventory_dispatch_warranty.py::test_inventory_dispatch_and_automatic_warranty PASSED [ 60%]
tests/test_quotations_orders.py::test_quotation_to_order_and_payment_flow PASSED [ 65%]
tests/test_surveys.py::test_survey_workflow_and_approval_rule PASSED     [ 70%]
tests/test_users.py::test_admin_create_sales_user PASSED                 [ 75%]
tests/test_users.py::test_duplicate_user_conflict PASSED                 [ 80%]
tests/test_users.py::test_non_admin_cannot_create_user PASSED            [ 85%]
tests/test_users.py::test_admin_list_users PASSED                        [ 90%]
tests/test_users.py::test_admin_deactivate_and_activate_user PASSED      [ 95%]
tests/test_users.py::test_admin_cannot_deactivate_self PASSED            [100%]

======================== 20 passed in 9.67s =========================
```

---

## 📬 Postman Collection

A complete, ready-to-use Postman Collection is located at:
📁 [`backend/postman_collection.json`](backend/postman_collection.json)

### Importing into Postman:
1. Open Postman and click **Import**.
2. Drag and drop `backend/postman_collection.json`.
3. Set the environment variable `base_url` to `http://localhost:8000/api/v1`.
4. Run the **Login (Admin)** request in `01. Authentication & Profile` to retrieve a JWT token.
5. Set the collection variable `admin_token` to authenticate requests across all 21 modules.

---

## 📄 License
Developed for **SunPower Solutions** — Solar Installation Management System.  
All rights reserved.
