, so # Warehouse Management System (WMS) — API Contract & Architecture Guide

## 1. System Overview

The **Solar Installation Management System (SIMS)** Warehouse Management Dashboard is an enterprise-grade operational frontend specifically engineered for solar equipment, stock management, procurement, warehouse logistics, and installation material dispatch.

The frontend is built using:
- **Framework**: React.js 18 + Vite
- **State Management**: Redux Toolkit (with 5 domain slices for Warehouse)
- **Styling**: Tailwind CSS with enterprise Forest Green (`#123C32`), Solar Amber (`#F5B942`), Neutral Slate theme tokens
- **Data Visualization**: Recharts (PieChart, AreaChart, BarChart)
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL 18 (`sunpower_db`)

---

## 2. Architectural Preservation & Isolation

### Zero-Regression Guarantee
- **Admin Dashboard**: Fully preserved (`/admin/*`) with all analytics, user management, and configuration tools.
- **Sales Dashboard**: Fully preserved (`/sales/*`) with leads, quotations, surveys, and customer portals.
- **Technician Dashboard**: Strict preservation (`/technician/*`) maintained untouched for active concurrent development by other team members.
- **Single Integrated Application**: One React SPA bundle; no separate apps or conflicting router instances.
- **State Management**: Existing slices (`auth`, `ui`, `theme`, `alerts`, `navigation`, `dashboard`, `sales`) preserved intact. 5 dedicated warehouse slices registered in `app/store.js`.

---

## 3. Warehouse Module Inventory (15 Modules)

| # | Route | Component | Purpose & Features |
|---|---|---|---|
| 1 | `/warehouse/dashboard` | `WarehouseDashboard.jsx` | 8 grouped KPIs, stock distribution Recharts, movement trends, quick-action operational queues |
| 2 | `/warehouse/products` | `WarehouseProductsPage.jsx` | Solar product master catalog, SKU search, category & status filtering, add/edit modal |
| 3 | `/warehouse/inventory` | `WarehouseInventoryPage.jsx` | Stock levels (on-hand, available, reserved, damaged), physical audit adjustment modal, add stock |
| 4 | `/warehouse/alerts` | `WarehouseAlertsPage.jsx` | Low/critical/out-of-stock monitoring, reorder level tracking, instant PO trigger action |
| 5 | `/warehouse/suppliers` | `WarehouseSuppliersPage.jsx` | Solar supplier directory, rating, lead times, GSTIN, payment terms, contact persons |
| 6 | `/warehouse/purchases` | `WarehousePurchasesPage.jsx` | Purchase orders (PO) management, line item builder, supplier linkage, status pipeline |
| 7 | `/warehouse/receipts` | `WarehouseReceiptsPage.jsx` | Goods Receipt Note (GRN) against POs, inspection accepted/rejected counts, auto stock increment |
| 8 | `/warehouse/stock-movements` | `WarehouseStockMovementsPage.jsx` | Immutable audit ledger of all inwards, outwards, adjustments, and reservations |
| 9 | `/warehouse/serial-numbers` | `WarehouseSerialsPage.jsx` | Barcode/QR scan, serial validation, warranty tracking, dispatch association |
| 10 | `/warehouse/transfers` | `WarehouseTransfersPage.jsx` | Inter-facility transfer orders between Main Depot, Regional Hub, and Field Hubs |
| 11 | `/warehouse/reservations` | `WarehouseReservationsPage.jsx` | Order-based hardware allocation (panels, inverters, batteries) locked for verified customer projects |
| 12 | `/warehouse/pending-dispatch` | `WarehousePendingDispatchPage.jsx` | Order picking, packing checklist, QA verification, driver & vehicle dispatch generation |
| 13 | `/warehouse/delivery-orders` | `WarehouseDeliveryOrdersPage.jsx` | In-transit shipment tracking, transporter details, vehicle number, delivery status |
| 14 | `/warehouse/delivery-confirmations` | `WarehouseDeliveryConfirmationsPage.jsx` | Field delivery acceptance, recipient sign-off, automatic order delivery & warranty activation |
| 15 | `/warehouse/reports` | `WarehouseReportsPage.jsx` | Stock valuation, supplier performance, dispatch fulfillment KPIs, one-click CSV export |

---

## 4. Backend API Integration & Fallback Strategy

The frontend communicates through `warehouseAPI.js` using the unified `axiosInstance` (`/api` base URL with automatic Bearer token injection).

When backend tables or routes are partially implemented or the user operates in offline/demo mode, the service layer transparently falls back to persistent operational seed data via `storageService.js` without UI crashes or missing state.

### 4.1 Live FastAPI Endpoints (Already Implemented in Backend)

#### Warehouse Dashboard Metrics
- **Method**: `GET`
- **Endpoint**: `/api/dashboard/warehouse`
- **Auth**: Required (`Bearer <token>`)
- **Response**:
```json
{
  "success": true,
  "data": {
    "kpi_metrics": {
      "total_products": 24,
      "total_on_hand_stock": 1420,
      "available_stock": 1180,
      "reserved_stock": 240,
      "low_stock_products": 3,
      "out_of_stock_products": 1,
      "total_suppliers": 8,
      "pending_purchase_orders": 4,
      "pending_dispatches": 6,
      "orders_ready_for_dispatch": 3
    },
    "stock_distribution": [...],
    "recent_movements": [...]
  }
}
```

#### Products & Catalog
- **GET** `/api/products` — Retrieve all solar SKUs with categories, warranty, and pricing.
- **POST** `/api/products` — Create a new solar product with SKU code and category.
- **GET** `/api/products/categories` — Fetch available solar product categories.

#### Inventory & Adjustments
- **GET** `/api/inventory` — List all warehouse inventory items with warehouse depot allocation.
- **POST** `/api/inventory/add-stock` — Inward stock against products (`product_id`, `quantity`, `warehouse_id`, `batch_number`).
- **POST** `/api/inventory/adjust-stock` — Physical audit reconciliation (`product_id`, `adjustment_type`, `quantity`, `reason`).
- **POST** `/api/inventory/reserve/{order_id}` — Reserve required BOM items for approved customer order.

#### Dispatch & Deliveries
- **GET** `/api/dispatches` — List active dispatches with vehicle, driver, and site info.
- **POST** `/api/dispatches` — Create dispatch package for an order (`order_id`, `warehouse_id`, `items`, `driver_name`, `driver_phone`, `vehicle_number`).
- **POST** `/api/dispatches/{id}/confirm-delivery` — Complete on-site proof of delivery (POD).

#### Serial Number Registration
- **POST** `/api/serials/register` — Register high-value serialized equipment (panels, inverters, batteries).
- **GET** `/api/serials/{serial_number}` — Trace lifecycle and warranty status of an equipment serial.

---

### 4.2 Recommended Future Backend Endpoints for Procurement & Transfers

To complement the existing endpoints, backend engineers can implement the following REST contracts to seamlessly connect the procurement and transfer modules:

#### Suppliers
- `GET /api/warehouse/suppliers` — Fetch suppliers list.
- `POST /api/warehouse/suppliers` — Add new supplier (`name`, `code`, `contact_person`, `phone`, `email`, `gstin`, `payment_terms`, `category`).
- `PUT /api/warehouse/suppliers/{id}` — Update supplier details.

#### Purchase Orders
- `GET /api/warehouse/purchases` — List purchase orders.
- `POST /api/warehouse/purchases` — Issue PO (`po_number`, `supplier_id`, `warehouse_id`, `expected_delivery_date`, `items: [{product_id, quantity, unit_price}]`).
- `PATCH /api/warehouse/purchases/{id}/status` — Transition PO status (`draft` -> `issued` -> `partially_received` -> `received` -> `cancelled`).

#### Goods Receipt Notes (GRN)
- `GET /api/warehouse/receipts` — List GRNs.
- `POST /api/warehouse/receipts` — Record incoming delivery (`po_id`, `supplier_id`, `warehouse_id`, `items: [{product_id, received_quantity, accepted_quantity, rejected_quantity, serial_numbers}]`).

#### Inter-Warehouse Transfers
- `GET /api/warehouse/transfers` — List transfer shipments.
- `POST /api/warehouse/transfers` — Request stock transfer (`source_warehouse_id`, `destination_warehouse_id`, `items: [...]`).
- `PATCH /api/warehouse/transfers/{id}/status` — Update transit status (`requested` -> `approved` -> `in_transit` -> `received`).

---

## 5. Local Development & Deployment Rules

1. **Local Only Policy**: All code, migrations, and database updates are strictly maintained in the local development environment. **No `git push` has been or will be executed.**
2. **PostgreSQL Configuration**: Running on port `5432`, database `sunpower_db`, fully migrated with Alembic.
3. **FastAPI Backend Server**: Running on `http://127.0.0.1:8000`.
4. **Vite Frontend Server**: Running on `http://localhost:3000`.

