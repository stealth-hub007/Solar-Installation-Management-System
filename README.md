# ☀️ SunPower Solutions — Solar Installation Management System (SIMS)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0_(Async)-D71F00.svg?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2.9-E92063.svg?style=flat&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![Pytest](https://img.shields.io/badge/Pytest-Async_Tests_Passing-brightgreen.svg?style=flat&logo=pytest&logoColor=white)](https://docs.pytest.org/)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg?style=flat)](#license)

> **Enterprise Full-Stack Solar Installation Management Platform** designed to manage and automate the full business lifecycle for residential and commercial rooftop solar installations (1 kW to 5 kW On-Grid & Off-Grid).
> 
> Combines a **React 18 + Vite + Tailwind + Redux Toolkit** enterprise Admin Portal with a **FastAPI + PostgreSQL + SQLAlchemy 2.0 Async** Modular Monolith backend.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [End-to-End Business Lifecycle](#-end-to-end-business-lifecycle)
- [System Architecture](#-system-architecture)
- [Frontend Admin Portal (React 18 + Vite)](#-frontend-admin-portal-react-18--vite)
- [Backend Services (FastAPI + PostgreSQL)](#-backend-services-fastapi--postgresql)
- [Quick Start Guide](#-quick-start-guide)
  - [1. Backend Setup](#1-backend-setup-fastapi--postgresql)
  - [2. Frontend Setup](#2-frontend-setup-react--vite)
- [API Contract & Integration](#-api-contract--integration)
- [Automated Testing](#-automated-testing)
- [Postman Collection](#-postman-collection)
- [License](#-license)

---

## 🌟 Project Overview

**SunPower Solutions** operates at a scale of **40+ rooftop solar projects per month** with **15 field technicians**, handling installations from **1 kW to 5 kW** in both **On-Grid** and **Off-Grid** topologies.

This system replaces paper logs, phone calls, and manual spreadsheets with an automated, interconnected workflow:

```text
Customer Enquiry ➔ Site Survey ➔ Admin Approval ➔ Quotation Engine (PDF) ➔ Order Confirmed (Advance 20%) ➔ 
Stock Reservation ➔ Dispatch Challan (Serials) ➔ Delivery Confirmation ➔ Auto-Generated Warranties ➔ 
Installation (7-Point Checklist & Sign-off) ➔ After-Sales Service (Warranty-Aware) ➔ Real-Time Project Profitability
```

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

## 🏗️ System Architecture

```text
Solar-Installation-Management-System/
├── frontend/                       # React 18 + Vite + Redux Toolkit + Tailwind CSS SPA
│   ├── src/                        # Application source code
│   │   ├── app/                    # Router and Redux store configuration
│   │   ├── components/             # Reusable UI components (Modals, Tables, Charts, Layout)
│   │   ├── features/               # 18 Domain feature modules (Dashboard, Projects, Inventory, etc.)
│   │   ├── services/               # Axios HTTP client and LocalStorage fallback layer
│   │   └── utils/                  # Formatting helpers (Currency, Dates, Numbers)
│   ├── public/                     # Static assets and icons
│   ├── API_CONTRACT.md             # Frontend-to-Backend REST API contract specification
│   ├── index.html                  # Frontend HTML root
│   ├── vite.config.js              # Vite bundler configuration (proxy to :8000)
│   ├── tailwind.config.js          # Tailwind CSS styling configuration
│   └── package.json                # Frontend npm dependencies
├── backend/                        # Production FastAPI Modular Monolith
│   ├── app/
│   │   ├── core/                   # Async DB engine, Pydantic settings, Bcrypt, JWT, exceptions
│   │   ├── models/                 # 39 SQLAlchemy 2.0 ORM models
│   │   ├── schemas/                # Pydantic v2 request/response schemas
│   │   ├── services/               # Business logic, pricing engine, approval gates, transactions
│   │   ├── routes/                 # 21 REST API route controllers mounted under /api/v1 and /api
│   │   ├── dependencies/           # RBAC permission guards (Admin, Sales, Tech, Warehouse)
│   │   └── utils/                  # ReportLab PDF generators (Quotations & Receipts)
│   ├── alembic/                    # Database migrations (all 39 tables)
│   ├── tests/                      # 20 Automated async Pytest integration tests (100% green)
│   ├── uploads/                    # File storage (site photos, customer signatures)
│   ├── postman_collection.json     # Complete Postman Collection
│   └── requirements.txt            # Locked production dependencies
├── README.md                       # Full-Stack Platform Documentation
└── .gitignore                      # Clean Git ignore rules (protects .env, node_modules, .venv)
```

---

## 💻 Frontend Admin Portal (React 18 + Vite)

- **Framework:** React 18 with Vite and Tailwind CSS.
- **State Management:** Redux Toolkit & React-Redux.
- **Analytics & Charts:** Recharts (Monthly revenue area charts, project status donut charts, weekly installation bar charts, inventory capacity charts).
- **Persistent Data & Mock Mode:** Dual-mode execution — seamlessly switches between browser `localStorage` demo mode and live FastAPI REST API calls via `axiosInstance`.
- **All 18 Operational Modules Implemented:**
  1. Executive Dashboard (9 KPI Cards, 4 Visual Charts, Prioritized Alerts)
  2. Customers Registry
  3. Enquiries / Lead Intake Pipeline
  4. Site Surveys & Approval Reviews
  5. Equipment & Product Catalog
  6. Quotation Builder & Estimation
  7. Confirmed Customer Orders
  8. Milestone Payments & Invoicing
  9. Warehouse Inventory Management
  10. Vehicle Dispatch & Challans
  11. Field Installation Management
  12. Warranty Certificates Registry
  13. After-Sales Service & O&M Tickets
  14. Financial P&L & Profitability
  15. Executive Reports & Exports
  16. System Notifications
  17. Immutable Audit Logs
  18. Role & Permission Settings

---

## ⚙️ Backend Services (FastAPI + PostgreSQL)

- **Framework:** FastAPI with Python 3.11+.
- **Database:** PostgreSQL with SQLAlchemy 2.0 (Async) and Alembic migrations.
- **Security:** OAuth2 with JWT, Bcrypt password hashing, and Role-Based Access Control (RBAC).
- **Enforced Business Rules:**
  - **Survey Approval Gate:** Quotation creation is strictly blocked in PostgreSQL until an Admin approves the site survey.
  - **Serial Number Barcode Tracking:** Tracks panels, inverters, and batteries from warehouse intake to customer dispatch.
  - **Automated Warranties:** Confirmed delivery automatically issues tamper-proof serialized warranty certificates.
  - **7-Point Safety Checklist:** Enforces mandatory electrical checkpoints (earthing < 5Ω, grid synchronization) and customer digital sign-off.
  - **Warranty-Aware Service:** In-warranty service actions automatically set customer charges to ₹0.00.
  - **Real-Time Profitability Engine:** Calculates project gross profit and margin % after deducting material procurement costs, labor, and logistics.

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI + PostgreSQL)

```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Apply database migrations (creates all 39 tables)
alembic upgrade head

# Start FastAPI server on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **Default Admin Login:** `admin@sunpower.com` / `Admin@12345Password`

---

### 2. Frontend Setup (React + Vite)

In a separate terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

Open browser at [http://localhost:3000](http://localhost:3000) (or `http://localhost:5173`).

---

## 📖 API Contract & Integration

The frontend and backend communicate via the endpoints detailed in [`frontend/API_CONTRACT.md`](frontend/API_CONTRACT.md).
Endpoints are served under both `/api/v1` and `/api` prefixes for seamless compatibility.

---

## 🧪 Automated Testing

Run the full async Pytest test suite:

```bash
cd backend
.venv/bin/pytest -v
```

**Results:** `20 passed in 9.27s (100% green)` covering RBAC, survey approval blocking rules, quotation-to-order conversions, automatic warranty generation, and financial profitability reports.

---

## 📄 License
Developed for **SunPower Solutions** — Solar Installation Management System.  
All rights reserved.
