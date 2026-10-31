# SunPower Solutions — Solar Installation Management System Backend

> **Production-grade Modular Monolith REST API** built with **FastAPI**, **SQLAlchemy 2.0 (Async)**, **PostgreSQL**, **Alembic**, and **Pydantic v2**.

---

## ☀️ System Overview

SunPower Solutions is a centralized, end-to-end solar installation management platform designed to automate and govern the entire solar project lifecycle for residential and small commercial rooftop installations (1 kW to 5 kW):

```text
Customer Enquiry ➔ Site Survey ➔ Quotation ➔ Order & Payment ➔ Inventory Reservation ➔ 
Dispatch & Delivery ➔ Automatic Warranty ➔ Installation & Testing ➔ After-Sales Service ➔ Financial Reporting
```

### Key Business Problems Solved
1. **Centralized Lead Capture:** Ingests enquiries across WhatsApp, phone calls, and web forms with automated follow-up scheduling.
2. **Automated Quotation Engine:** Prevents missing components by coupling quotes to standardized 1kW–5kW On-Grid/Off-Grid packages and survey roof data.
3. **Survey Approval Gate:** Strictly blocks quotation generation until an Admin approves the site survey measurements and shadow analysis.
4. **Hardware Serial Number Tracking:** Eliminates paper logs by tracking solar panels, inverters, and batteries from warehouse inward to customer dispatch.
5. **Automated Warranty Certificates:** Generates tamper-proof warranty certificates linked to equipment serial numbers upon delivery confirmation.
6. **Installation Quality Assurance:** Mandatory 7-point electrical checklist, commissioning test records, photos, and customer digital sign-off.
7. **Warranty-Aware After-Sales Service:** Dynamically calculates service fees—₹0.00 if active warranty exists, or chargeable if expired or caused by external damage.
8. **Real-time Project Profitability:** Calculates project-level gross profit and margin by deducting material purchase cost, labor, logistics, and overhead from realized revenue.

---

## 🛠️ Technology Stack

| Layer | Technology | Specification / Purpose |
|---|---|---|
| **Language** | Python 3.11+ | Modern type hints, `async`/`await` |
| **Backend Framework** | FastAPI | High-performance asynchronous REST API framework |
| **Database** | PostgreSQL | Enterprise relational database |
| **ORM** | SQLAlchemy 2.0 | Async Engine, `Mapped`, `mapped_column`, typed declarative models |
| **Data Validation** | Pydantic v2 | High-speed C-based validation, `BaseModel`, `Field`, custom validators |
| **Database Migrations** | Alembic | Asynchronous migration pipeline with version control |
| **Authentication & RBAC** | JWT (OAuth2) & Passlib | Bcrypt hashing, access & refresh tokens, role-based dependencies |
| **Document Generation** | ReportLab | High-resolution PDF generation for Quotations and Payment Receipts |
| **Testing** | Pytest & Pytest-Asyncio | 100% async test suite with HTTPX test client |
| **API Documentation** | Swagger UI & ReDoc | OpenAPI 3.1 interactive API documentation |
| **File Storage** | Local File Storage | Modular storage service (ready for S3/MinIO plug-in) |

---

## 📁 Project Directory Structure

```text
backend/
├── app/
│   ├── main.py                     # FastAPI application entry point, lifespan, CORS, route registry
│   ├── core/                       # Core configuration, database engine, security & exceptions
│   │   ├── config.py               # Pydantic Settings v2 configuration
│   │   ├── database.py             # SQLAlchemy 2.0 Async engine, sessionmaker & Base
│   │   ├── security.py             # Bcrypt password hashing, JWT generation, OTP utility
│   │   ├── exceptions.py           # Custom business exceptions & global FastAPI exception handlers
│   │   └── init_db.py              # Database seeder (Admin account, solar catalog, 1kW-5kW packages)
│   ├── models/                     # SQLAlchemy 2.0 ORM models (39 tables)
│   │   ├── base.py                 # Base model with UUID primary keys and UTC timestamps
│   │   ├── user.py                 # Users, Roles, and PasswordResetOTP
│   │   ├── customer.py             # Customers and Enquiry models
│   │   ├── survey.py               # Site Surveys and Survey Photos
│   │   ├── product.py              # Products, Categories, Packages, and Package Items
│   │   ├── quotation.py            # Quotations and Quotation Line Items
│   │   ├── order.py                # Orders, Order Items, and Payments
│   │   ├── inventory.py            # Inventory, Stock Transactions, and Serial Numbers
│   │   ├── dispatch.py             # Dispatch Challans, Dispatch Items, and Dispatched Serials
│   │   ├── warranty.py             # Warranty Records and Warranty Claims
│   │   ├── installation.py         # Installation Jobs, 7-Point Checklists, Test Records, Photos
│   │   ├── service_ticket.py       # Service Tickets and Service Actions
│   │   ├── finance.py              # Project Expenses and Financial Records
│   │   └── system.py               # Notifications and System Audit Logs
│   ├── schemas/                    # Pydantic v2 request/response validation schemas
│   │   ├── common.py               # Standard APIResponse, APIErrorResponse, pagination schemas
│   │   ├── user.py                 # User creation, login, token, and profile schemas
│   │   ├── customer.py             # Customer & Enquiry schemas
│   │   ├── survey.py               # Survey measurements, photos, approval schemas
│   │   ├── product.py              # Product and Package schemas
│   │   ├── quotation.py            # Quotation creation and PDF schemas
│   │   ├── order.py                # Order and payment schemas
│   │   ├── inventory.py            # Stock adjustments and serial number schemas
│   │   ├── dispatch.py             # Dispatch challan and delivery confirmation schemas
│   │   ├── warranty.py             # Warranty verification schemas
│   │   ├── installation.py         # Checklist, testing, and customer sign-off schemas
│   │   ├── service_ticket.py       # Ticket creation and resolution schemas
│   │   ├── finance.py              # Expense and profitability schemas
│   │   └── dashboard.py            # Executive dashboard summary schemas
│   ├── routes/                     # Clean API endpoints mounted under /api/v1
│   │   ├── health.py               # Health check and database ping
│   │   ├── auth.py                 # Login, refresh token, profile, password reset with OTP
│   │   ├── users.py                # Admin user CRUD and activation/deactivation
│   │   ├── customers.py            # Customer lifecycle and history
│   │   ├── enquiries.py            # Leads, assignment, status, and follow-ups
│   │   ├── surveys.py              # Survey scheduling, measurement recording, and admin approval
│   │   ├── products.py             # Product catalog management
│   │   ├── packages.py             # 1kW to 5kW On-Grid and Off-Grid solar packages
│   │   ├── quotations.py           # Quotation generation, pricing calculation, PDF download
│   │   ├── orders.py               # Order conversion from accepted quotation
│   │   ├── payments.py             # Payment recording and PDF receipt generation
│   │   ├── inventory.py            # Real-time stock levels, low-stock alerts, transactions
│   │   ├── serials.py              # Serial number registration and barcode verification
│   │   ├── dispatches.py           # Dispatch challans and delivery confirmation
│   │   ├── warranties.py           # Warranty registry and certificate verification
│   │   ├── installations.py        # 7-point checklist, test logs, photos, and digital sign-off
│   │   ├── service_tickets.py      # After-sales tickets, technician assignment, warranty check
│   │   ├── expenses.py             # Order-linked expense recording and categorization
│   │   ├── reports.py              # Profitability, revenue, and inventory valuation reports
│   │   ├── dashboard.py            # Executive KPI dashboard summary
│   │   └── notifications.py        # System alerts and notifications
│   ├── services/                   # Business logic and transaction orchestration layer
│   │   ├── auth_service.py         # Authentication, JWT, and OTP password reset logic
│   │   ├── user_service.py         # User management operations
│   │   ├── customer_service.py     # Customer deduplication and relationship management
│   │   ├── survey_service.py       # Survey workflows and status transitions
│   │   ├── product_service.py      # Inventory product catalog operations
│   │   ├── quotation_service.py    # Pricing engine and survey approval validation
│   │   ├── order_service.py        # Order creation and automated installation job spawning
│   │   ├── payment_service.py      # Multi-stage payment recording and balance calculation
│   │   ├── inventory_service.py    # Stock reservation, release, and adjustment
│   │   ├── dispatch_service.py     # Dispatch challans and automated warranty generation
│   │   ├── warranty_service.py     # Warranty verification and claim processing
│   │   ├── installation_service.py # Installation checklists, milestone tracking, and sign-offs
│   │   ├── service_ticket_service.py # After-sales ticket triage and warranty cost analysis
│   │   ├── finance_service.py      # Project expenses and profitability calculations
│   │   ├── dashboard_service.py    # Executive metrics and KPI aggregation
│   │   └── notification_service.py # System notifications and low-stock alerts
│   ├── dependencies/               # Reusable FastAPI dependencies
│   │   └── auth.py                 # Current user extraction and role-based guards
│   └── utils/                      # Reusable utility modules
│       ├── pdf_generator.py        # ReportLab PDF generators for Quotations and Receipts
│       └── file_storage.py         # Local filesystem upload handlers
├── alembic/                        # Database migration scripts
│   ├── env.py                      # Asynchronous migration environment
│   └── versions/                   # Versioned migration files
├── uploads/                        # Upload directories for photos, receipts, and signatures
├── tests/                          # Automated Pytest suite (20 tests, 100% passing)
│   ├── conftest.py                 # Async test client fixture with isolated PostgreSQL DB
│   ├── test_health.py              # Health check tests
│   ├── test_auth.py                # Authentication, JWT, OTP tests
│   ├── test_users.py               # User RBAC and admin management tests
│   ├── test_customers_enquiries.py # Customer & Enquiry lifecycle tests
│   ├── test_surveys.py             # Survey workflow and quotation blocking rule tests
│   ├── test_quotations_orders.py   # Quotation, Order, and Payment flow tests
│   ├── test_inventory_dispatch_warranty.py # Inventory, Dispatch, and Warranty generation tests
│   └── test_installations_services_finance.py # Installation, Checklist, Service & Profitability tests
├── postman_collection.json         # Complete Postman Collection covering all 21 API modules
├── requirements.txt                # Pinned production dependencies
├── pytest.ini                      # Pytest async configuration
├── alembic.ini                     # Alembic configuration
├── database_setup.sql              # Database setup script
├── .env.example                    # Sample environment variables
└── README.md                       # Comprehensive system documentation
```

---

## 👥 Role-Based Access Control (RBAC)

The system enforces strict role-based authorization using dependency injection:

| Role | Responsibilities & Access Permissions |
|---|---|
| **Admin / Management** | Full system access: User management, survey approval, pricing rules, order management, expense approvals, financial profitability reports, and executive dashboards. |
| **Sales Executive** | Lead capture, customer registration, scheduling site surveys, creating quotations (after survey approval), managing quotation acceptance, and recording payments. |
| **Field Technician** | Viewing assigned surveys, recording roof measurements, uploading site photographs, completing 7-point installation checklists, logging electrical test results, uploading customer digital sign-offs, and resolving service tickets. |
| **Warehouse Manager** | Real-time stock visibility, inward/outward adjustments, serial number barcode scanning, dispatch challan preparation, equipment verification, and delivery confirmation. |

---

## ⚡ Core Business Rules & Workflows

### 1. The Site Survey Approval Gate
* Quotation creation is **strictly blocked** unless the linked site survey is in `approved` status.
* Field technicians submit measurements and roof shadow photos.
* Only an **Admin** can approve or reject the survey with reasons.
* A rejected survey can be updated and resubmitted by the technician.

### 2. Standardized Solar Packages (1kW–5kW)
* The system comes pre-seeded with standardized packages:
  * **On-Grid Packages:** Solar panels, Grid-tie Inverter, Mounting structures, DC/AC distribution boxes, Earthing kit, Cables and Connectors.
  * **Off-Grid Packages:** Solar panels, Off-grid Solar Inverter, Battery Bank, Charge Controller, Mounting structures, DC/AC boxes, Earthing kit.
* Each package specifies exact bill-of-materials quantities preventing missing components in quotations.

### 3. Quotation & Pricing Engine
* Calculates:
  $$\text{Components Total} + \text{Installation Charge} + \text{Transportation Charge} - \text{Discount} = \text{Taxable Subtotal}$$
  $$\text{Taxable Subtotal} + \text{GST (13.8\%)} - \text{Subsidy} = \text{Final Customer Payable}$$
* Generates downloadable, customer-ready **ReportLab PDF Quotations** containing itemized components, pricing breakdown, subsidy details, and company bank account details.

### 4. Order Conversion & Automated Installation Job
* When an accepted quotation is converted into an order:
  1. An `Order` is created with a `confirmed` status.
  2. Inventory items are automatically reserved.
  3. An `InstallationJob` is automatically spawned in `pending` status.
  4. A blank **7-point installation checklist** is initialized for the technician.

### 5. Multi-Stage Payment Recording
* Supports split milestone payments:
  * **Advance (20%)** upon quotation acceptance
  * **Pre-Dispatch (60%)** before equipment leaves warehouse
  * **Final (20%)** after customer testing and digital sign-off
* Generates downloadable **ReportLab Payment Receipts** with transaction references.

### 6. Serial Number Tracking & Automated Warranties
* High-value equipment (Solar Panels, Inverters, Batteries) requires serial number assignment.
* When the warehouse confirms dispatch delivery:
  * Dispatched serials are marked as `installed`.
  * Tamper-proof **Warranty Certificates** are automatically generated for all serialized items with start date = delivery date and expiration date calculated from product warranty duration.

### 7. 7-Point Commissioning Checklist & Customer Sign-off
* Technicians must verify 7 safety milestones:
  1. Mounting structure torque & wind load resistance
  2. Panel orientation and tilt angle
  3. DC cabling, conduits, and polarity
  4. Inverter mounting, ventilation, and wiring
  5. Earthing resistance (< 5 Ohms)
  6. AC distribution box, SPD, and MCBs
  7. Grid synchronization and anti-islanding test
* Customer digital sign-off (satisfaction rating + signature upload) completes commissioning.

### 8. Warranty-Aware Service Tickets
* When a service ticket is created, the system checks whether the customer's equipment is still under active warranty.
* If active, service actions default customer charge to **₹0.00**.
* If warranty has expired or the damage is user-inflicted, charges are applied.

### 9. Real-Time Project Profitability Engine
* Management can inspect profitability for any completed or ongoing solar installation:
  $$\text{Net Profit} = \text{Order Revenue} - (\text{Material Cost} + \text{Direct Expenses} + \text{Warranty/Service Cost})$$
  $$\text{Profit Margin \%} = \frac{\text{Net Profit}}{\text{Order Revenue}} \times 100$$

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.11+
- PostgreSQL 15+ running locally or in Docker

### 2. Database Creation
Connect to your local PostgreSQL instance and create the development and test databases:
```sql
CREATE DATABASE sunpower_db;
CREATE DATABASE sunpower_test_db;
```

### 3. Virtual Environment Setup
From the `backend/` directory:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Environment Variables
Create `.env` by copying `.env.example`:
```bash
cp .env.example .env
```
Ensure your database URL and secrets are configured:
```env
PROJECT_NAME="SunPower Solutions"
DATABASE_URL="postgresql+asyncpg://<postgres_user>:<postgres_password>@localhost:5432/sunpower_db"
JWT_SECRET_KEY="sunpower-super-secret-jwt-key-replace-in-production"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=120
REFRESH_TOKEN_EXPIRE_DAYS=7
UPLOAD_DIR="uploads"
MAX_UPLOAD_SIZE_MB=10
```

### 5. Run Database Migrations
Apply the complete database schema (all 39 tables) via Alembic:
```bash
alembic upgrade head
```

### 6. Run the Application
Start the FastAPI development server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
On startup, the system automatically initializes the database with:
- **Default Admin Account:**
  - **Email:** `admin@sunpower.com`
  - **Password:** `Admin@12345Password`
- **Default Product Catalog:** Solar panels, inverters, batteries, charge controllers, structures, earthing kits.
- **Default Packages:** 1 kW to 5 kW On-Grid and Off-Grid configurations.

### 7. Interactive API Documentation
Open your browser to:
- **Swagger UI:** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **ReDoc:** [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
- **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🧪 Automated Testing

The backend includes a comprehensive async test suite covering authentication, RBAC, business workflows, survey approval rules, order conversions, automatic warranty creation, and financial profitability reports.

Run tests using pytest:
```bash
cd backend
.venv/bin/pytest -v
```

### Test Suite Summary:
```text
tests/test_auth.py::test_admin_login_success PASSED
tests/test_auth.py::test_login_invalid_password PASSED
tests/test_auth.py::test_refresh_token_flow PASSED
tests/test_auth.py::test_get_current_user_profile PASSED
tests/test_auth.py::test_update_profile PASSED
tests/test_auth.py::test_password_reset_with_otp_flow PASSED
tests/test_customers_enquiries.py::test_customer_lifecycle PASSED
tests/test_customers_enquiries.py::test_enquiry_lifecycle_and_followups PASSED
tests/test_health.py::test_root_endpoint PASSED
tests/test_health.py::test_health_check_endpoint PASSED
tests/test_installations_services_finance.py::test_installation_service_tickets_and_finance_flow PASSED
tests/test_inventory_dispatch_warranty.py::test_inventory_dispatch_and_automatic_warranty PASSED
tests/test_quotations_orders.py::test_quotation_to_order_and_payment_flow PASSED
tests/test_surveys.py::test_survey_workflow_and_approval_rule PASSED
tests/test_users.py::test_admin_create_sales_user PASSED
tests/test_users.py::test_duplicate_user_conflict PASSED
tests/test_users.py::test_non_admin_cannot_create_user PASSED
tests/test_users.py::test_admin_list_users PASSED
tests/test_users.py::test_admin_deactivate_and_activate_user PASSED
tests/test_users.py::test_admin_cannot_deactivate_self PASSED

======================== 20 passed in 9.27s =========================
```

---

## 📬 Postman Collection

A complete Postman Collection is provided at:
`backend/postman_collection.json`

### Importing into Postman:
1. Open Postman.
2. Click **Import** and select `backend/postman_collection.json`.
3. Set the environment variable `base_url` to `http://localhost:8000/api/v1`.
4. Run the **Login (Admin)** request under `01. Authentication & Profile` to obtain your Bearer token.
5. Paste the token into the collection's `admin_token` variable to authenticate all subsequent requests.

---

## 📄 License & Intellectual Property
Developed for **SunPower Solutions** — Solar Installation Management System.
All rights reserved.
