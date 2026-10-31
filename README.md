# Solar Installation Management System (SIMS) — Enterprise Admin Portal

Production-grade, enterprise SaaS Admin Portal for the **Solar Installation Management System (SIMS)** built with **React 18**, **Vite**, **Tailwind CSS**, **Redux Toolkit**, **React Router v6**, **Recharts**, and **Lucide React**.

Equipped with a **persistent LocalStorage data layer**, **full administrative CRUD operations across all modules**, and ready for seamless integration with a **FastAPI / SQLAlchemy / PostgreSQL** backend.

---

## ☀️ Highlights & Capabilities

### 1. Persistent LocalStorage Data Layer (`storageService.js`)
- All operational sample data is stored in the browser's `localStorage` (`sims_projects_data`, `sims_payments_data`, `sims_enquiries_data`, `sims_tickets_data`, `sims_alerts_data`, `sims_inventory_data`, `sims_activities_data`).
- **Dynamic Metric Recalculation:**
  - Creating, updating, or deleting projects immediately recalculates Active Projects, Pending Surveys, and Pipeline distribution.
  - Recording or editing payments updates Total Revenue, Cash Collections, Outstanding Balance, and monthly charts.
  - Logging or resolving service tickets dynamically triggers/dismisses operational alerts and updates ticket counts.
  - Adding, editing, or deleting any entity automatically logs a detailed entry in the **Operational Audit Trail**.
- **One-Click Reset Sample Data:** Instant button in the Dashboard Welcome header and Settings page to restore clean baseline demo records at any time.

### 2. Full Administrative CRUD Across All Tables & Modules
- **Projects:**
  - `Create`: Register new solar project (Name, Customer, Capacity kW, Location, Status, Technician).
  - `Read`: Full specification details modal.
  - `Update`: Edit project lifecycle stage, capacity, or assigned engineer.
  - `Delete`: Modal with warning confirmation.
- **Payments:**
  - `Create`: Record new milestone collections, customer advances, or subsidy credits.
  - `Read`: Detailed payment voucher modal.
  - `Update`: Edit amount, status (Completed, Pending, Failed), or channel.
  - `Delete`: Delete transaction with automatic revenue rollback.
- **Enquiries (Leads):**
  - `Create`: Ingest new leads with source, capacity, and phone.
  - `Read`: View lead profile with direct `tel:` dialing.
  - `Update`: Move lead between stages (*New*, *In Review*, *Survey Scheduled*, *Quoted*).
  - `Delete`: Remove lead records.
- **Service & O&M Tickets:**
  - `Create`: Log breakdown tickets with priority (*Critical*, *High*, *Medium*, *Low*). Critical tickets auto-broadcast to executive alerts.
  - `Read`: Inspection and diagnostics modal.
  - `Update`: Update resolution status (*Open*, *In Progress*, *Resolved*, *Closed*).
  - `Delete`: Delete ticket.
- **Operational Alerts:**
  - `Create`: Broadcast urgent system notifications and field alerts.
  - `Dismiss / Resolve`: Mark alerts as resolved with instant dismissal.
- **Warehouse Inventory:**
  - `Adjust`: Increment / decrement stock on hand for PV modules, inverters, batteries, and BOS kits.
  - `Create`: Add new equipment categories with low stock thresholds.

### 3. All 17 Operational Modules Accessible in Sidebar
Every navigation link in the sidebar is active and connected to the central storage:
1. **Dashboard** (`/admin/dashboard`): 9 KPIs, 4 Recharts analytics, prioritized alerts, 5-tab data ledger.
2. **Customers** (`/admin/customers`): Registered consumer registry, cumulative installed capacity, contact details.
3. **Enquiries** (`/admin/enquiries`): Lead intake, acquisition source tracking, status filtering.
4. **Surveys** (`/admin/surveys`): Shadow-free rooftop feasibility checks, surveyor assignment, approval authorization.
5. **Products** (`/admin/products`): Tier-1 PV module, inverter, and battery catalogue with pricing and warranties.
6. **Quotations** (`/admin/quotations`): Generation kWh estimations, MNRE subsidy deductions, proposal approval.
7. **Orders** (`/admin/orders`): Confirmed contracts and fulfillment progress bars.
8. **Payments** (`/admin/payments`): Ledger of all bank transfers, NEFT, UPI, and cheques.
9. **Inventory** (`/admin/inventory`): Stock levels, reserved project stock, and safety buffer adjustments.
10. **Dispatch** (`/admin/dispatch`): Material gate passes, delivery challans, and vehicle logistics.
11. **Installations** (`/admin/installations`): Field execution, structure mounting, and DISCOM synchronization.
12. **Warranty** (`/admin/warranty`): 25-year panel performance guarantees and inverter RMA claims.
13. **Service Tickets** (`/admin/service-tickets`): O&M breakdown tickets, SLA response tracking.
14. **Finance** (`/admin/finance`): P&L insights, 12% solar GST calculations, capital expenditure splits.
15. **Reports** (`/admin/reports`): Clean energy MWh generated, carbon offset metric tons, CSV/PDF export.
16. **Notifications** (`/admin/notifications`): Critical system action alerts and broadcasts.
17. **Audit Logs** (`/admin/audit-logs`): Real-time immutable audit trail of all administrator actions.
18. **Settings** (`/admin/settings`): Organization profile, RBAC matrix, and sample data reset tool.

---

## 📁 Architecture & Technologies

- **Frontend:** React 18, Vite, JavaScript (ES6+), Tailwind CSS
- **State Management:** Redux Toolkit, React Redux, Context API
- **Persistence:** LocalStorage sync engine (`storageService.js`)
- **Routing:** React Router v6 (`createBrowserRouter`, `lazy`, `Suspense`)
- **Charts:** Recharts (Area, Donut, Bar charts)
- **Icons:** Lucide React
- **API Client:** Centralized Axios instance with standard error interceptors

---

## 🚀 Running the Project

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

Open browser at `http://localhost:3000`.

### Production Build
```powershell
npm run build
npm run preview
```
All 18 routes build with zero errors.
