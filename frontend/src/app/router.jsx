import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import SalesLayout from '../components/layout/SalesLayout';
import TechnicianLayout from '../components/layout/TechnicianLayout';
import WarehouseLayout from '../components/layout/WarehouseLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute, { RootRedirect } from '../components/auth/PublicRoute';
import Loader from '../components/common/Loader';

// Direct imports for auth pages to prevent lazy suspense flicker
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import PendingApprovalPage from '../features/auth/PendingApprovalPage';
import {
  AccountRejectedPage,
  AccountSuspendedPage,
  UnauthorizedPage,
} from '../features/auth/AccountStatusPages';

// Lazy-loaded Warehouse Pages
const WarehouseDashboard = lazy(() => import('../features/warehouse/pages/WarehouseDashboard'));
const WarehouseProductsPage = lazy(() => import('../features/warehouse/pages/WarehouseProductsPage'));
const WarehouseInventoryPage = lazy(() => import('../features/warehouse/pages/WarehouseInventoryPage'));
const WarehouseAlertsPage = lazy(() => import('../features/warehouse/pages/WarehouseAlertsPage'));
const WarehouseSuppliersPage = lazy(() => import('../features/warehouse/pages/WarehouseSuppliersPage'));
const WarehousePurchasesPage = lazy(() => import('../features/warehouse/pages/WarehousePurchasesPage'));
const WarehouseReceiptsPage = lazy(() => import('../features/warehouse/pages/WarehouseReceiptsPage'));
const WarehouseStockMovementsPage = lazy(() => import('../features/warehouse/pages/WarehouseStockMovementsPage'));
const WarehouseSerialsPage = lazy(() => import('../features/warehouse/pages/WarehouseSerialsPage'));
const WarehouseTransfersPage = lazy(() => import('../features/warehouse/pages/WarehouseTransfersPage'));
const WarehouseReservationsPage = lazy(() => import('../features/warehouse/pages/WarehouseReservationsPage'));
const WarehousePendingDispatchPage = lazy(() => import('../features/warehouse/pages/WarehousePendingDispatchPage'));
const WarehouseDeliveryOrdersPage = lazy(() => import('../features/warehouse/pages/WarehouseDeliveryOrdersPage'));
const WarehouseDeliveryConfirmationsPage = lazy(() => import('../features/warehouse/pages/WarehouseDeliveryConfirmationsPage'));
const WarehouseReportsPage = lazy(() => import('../features/warehouse/pages/WarehouseReportsPage'));

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('../features/dashboard/pages/AdminDashboard'));
const UserManagementPage = lazy(() => import('../features/admin/users/UserManagementPage'));
const CustomersPage = lazy(() => import('../features/customers/CustomersPage'));
const EnquiriesPage = lazy(() => import('../features/enquiries/EnquiriesPage'));
const SurveysPage = lazy(() => import('../features/surveys/SurveysPage'));
const ProductsPage = lazy(() => import('../features/products/ProductsPage'));
const QuotationsPage = lazy(() => import('../features/quotations/QuotationsPage'));
const OrdersPage = lazy(() => import('../features/orders/OrdersPage'));
const PaymentsPage = lazy(() => import('../features/payments/PaymentsPage'));
const InventoryPage = lazy(() => import('../features/inventory/InventoryPage'));
const DispatchPage = lazy(() => import('../features/dispatch/DispatchPage'));
const InstallationsPage = lazy(() => import('../features/installations/InstallationsPage'));
const WarrantyPage = lazy(() => import('../features/warranty/WarrantyPage'));
const ServiceTicketsPage = lazy(() => import('../features/service-tickets/ServiceTicketsPage'));
const FinancePage = lazy(() => import('../features/finance/FinancePage'));
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'));
const AuditLogsPage = lazy(() => import('../features/audit-logs/AuditLogsPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const ProfileOverviewPage = lazy(() => import('../features/profile/ProfileOverviewPage'));
const RolesPermissionsPage = lazy(() => import('../features/roles/RolesPermissionsPage'));

// Lazy-loaded Sales Pages
const SalesDashboard = lazy(() => import('../features/sales/pages/SalesDashboard'));
const SalesCustomersPage = lazy(() => import('../features/sales/pages/CustomersPage'));
const SalesCustomerDetailsPage = lazy(() => import('../features/sales/pages/CustomerDetailsPage'));
const SalesEnquiriesPage = lazy(() => import('../features/sales/pages/EnquiriesPage'));
const SalesEnquiryDetailsPage = lazy(() => import('../features/sales/pages/EnquiryDetailsPage'));
const SalesFollowUpsPage = lazy(() => import('../features/sales/pages/FollowUpsPage'));
const SalesSurveysPage = lazy(() => import('../features/sales/pages/SurveysPage'));
const SalesQuotationsPage = lazy(() => import('../features/sales/pages/QuotationsPage'));
const SalesQuotationDetailsPage = lazy(() => import('../features/sales/pages/QuotationDetailsPage'));
const SalesOrdersPage = lazy(() => import('../features/sales/pages/OrdersPage'));

// Lazy-loaded Technician Pages
const TechnicianDashboard = lazy(() => import('../features/technician/pages/TechnicianDashboard'));
const MyTasksPage = lazy(() => import('../features/technician/pages/MyTasksPage'));
const AssignedSurveysPage = lazy(() => import('../features/technician/pages/AssignedSurveysPage'));
const SurveyDetailsPage = lazy(() => import('../features/technician/pages/SurveyDetailsPage'));
const SurveySubmissionPage = lazy(() => import('../features/technician/pages/SurveySubmissionPage'));
const AssignedInstallationsPage = lazy(() => import('../features/technician/pages/AssignedInstallationsPage'));
const InstallationDetailsPage = lazy(() => import('../features/technician/pages/InstallationDetailsPage'));
const InstallationChecklistPage = lazy(() => import('../features/technician/pages/InstallationChecklistPage'));
const TechnicianProfilePage = lazy(() => import('../features/technician/pages/TechnicianProfilePage'));

export const router = createBrowserRouter([
  // Root smart router
  {
    path: '/',
    element: <RootRedirect />,
  },

  // Public Authentication Routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center max-w-md">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Password Reset Request</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              To ensure enterprise operational security, SIMS credentials can only be reset by your System Administrator. Please contact admin@sunpower.com.
            </p>
            <a
              href="/login"
              className="inline-flex px-4 py-2 bg-[#0284C7] text-white text-xs font-bold rounded-lg hover:bg-[#0369A1] transition"
            >
              Return to Login
            </a>
          </div>
        </div>
      </PublicRoute>
    ),
  },

  // Account Status Routes
  {
    path: '/pending-approval',
    element: <PendingApprovalPage />,
  },
  {
    path: '/account-rejected',
    element: <AccountRejectedPage />,
  },
  {
    path: '/account-suspended',
    element: <AccountSuspendedPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },

  // Admin Module (Admin role required - Admin also has permission for all other modules)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="ADMIN" requiredPermission="admin.dashboard">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'enquiries',
        element: <EnquiriesPage />,
      },
      {
        path: 'surveys',
        element: <SurveysPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'quotations',
        element: <QuotationsPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'payments',
        element: <PaymentsPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'dispatch',
        element: <DispatchPage />,
      },
      {
        path: 'installations',
        element: <InstallationsPage />,
      },
      {
        path: 'warranty',
        element: <WarrantyPage />,
      },
      {
        path: 'service-tickets',
        element: <ServiceTicketsPage />,
      },
      {
        path: 'finance',
        element: <FinancePage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'audit-logs',
        element: <AuditLogsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'profile',
        element: <ProfileOverviewPage />,
      },
      {
        path: 'roles-permissions',
        element: <RolesPermissionsPage />,
      },
      {
        path: 'roles',
        element: <RolesPermissionsPage />,
      },
    ],
  },

  // Sales Module (Sales role or Admin authorized)
  {
    path: '/sales',
    element: (
      <ProtectedRoute requiredRole="SALES" requiredPermission="sales.dashboard">
        <SalesLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/sales/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <SalesDashboard />,
      },
      {
        path: 'customers',
        element: <SalesCustomersPage />,
      },
      {
        path: 'customers/:customerId',
        element: <SalesCustomerDetailsPage />,
      },
      {
        path: 'enquiries',
        element: <SalesEnquiriesPage />,
      },
      {
        path: 'enquiries/:enquiryId',
        element: <SalesEnquiryDetailsPage />,
      },
      {
        path: 'follow-ups',
        element: <SalesFollowUpsPage />,
      },
      {
        path: 'surveys',
        element: <SalesSurveysPage />,
      },
      {
        path: 'quotations',
        element: <SalesQuotationsPage />,
      },
      {
        path: 'quotations/:quotationId',
        element: <SalesQuotationDetailsPage />,
      },
      {
        path: 'orders',
        element: <SalesOrdersPage />,
      },
    ],
  },

  // Warehouse Module (Warehouse role or Admin authorized)
  {
    path: '/warehouse',
    element: (
      <ProtectedRoute requiredRole="WAREHOUSE" requiredPermission="warehouse.dashboard">
        <WarehouseLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/warehouse/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <WarehouseDashboard />,
      },
      {
        path: 'products',
        element: <WarehouseProductsPage />,
      },
      {
        path: 'inventory',
        element: <WarehouseInventoryPage />,
      },
      {
        path: 'alerts',
        element: <WarehouseAlertsPage />,
      },
      {
        path: 'suppliers',
        element: <WarehouseSuppliersPage />,
      },
      {
        path: 'purchases',
        element: <WarehousePurchasesPage />,
      },
      {
        path: 'receipts',
        element: <WarehouseReceiptsPage />,
      },
      {
        path: 'stock-movements',
        element: <WarehouseStockMovementsPage />,
      },
      {
        path: 'serial-numbers',
        element: <WarehouseSerialsPage />,
      },
      {
        path: 'transfers',
        element: <WarehouseTransfersPage />,
      },
      {
        path: 'reservations',
        element: <WarehouseReservationsPage />,
      },
      {
        path: 'pending-dispatch',
        element: <WarehousePendingDispatchPage />,
      },
      {
        path: 'delivery-orders',
        element: <WarehouseDeliveryOrdersPage />,
      },
      {
        path: 'delivery-confirmations',
        element: <WarehouseDeliveryConfirmationsPage />,
      },
      {
        path: 'reports',
        element: <WarehouseReportsPage />,
      },
    ],
  },

  // Technician Module (Technician role or Admin authorized)
  {
    path: '/technician',
    element: (
      <ProtectedRoute requiredRole="TECHNICIAN" requiredPermission="technician.dashboard">
        <TechnicianLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/technician/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <TechnicianDashboard />,
      },
      {
        path: 'tasks',
        element: <MyTasksPage />,
      },
      {
        path: 'surveys',
        element: <AssignedSurveysPage />,
      },
      {
        path: 'surveys/:surveyId',
        element: <SurveyDetailsPage />,
      },
      {
        path: 'surveys/:surveyId/submit',
        element: <SurveySubmissionPage />,
      },
      {
        path: 'installations',
        element: <AssignedInstallationsPage />,
      },
      {
        path: 'installations/:installationId',
        element: <InstallationDetailsPage />,
      },
      {
        path: 'installations/:installationId/checklist',
        element: <InstallationChecklistPage />,
      },
      {
        path: 'profile',
        element: <TechnicianProfilePage />,
      },
    ],
  },

  // 404 Fallback
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-elevated">
          <h1 className="text-4xl font-extrabold text-[#0284C7]">404</h1>
          <h2 className="text-lg font-semibold text-slate-800 mt-2 mb-1">Page Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The operational route you requested does not exist in SIMS.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#0284C7] text-white rounded-lg text-sm font-semibold hover:bg-[#0369A1] transition"
          >
            Return to SIMS Home
          </a>
        </div>
      </div>
    ),
  },
]);

export default router;
