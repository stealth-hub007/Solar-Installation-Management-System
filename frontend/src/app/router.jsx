import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import SalesLayout from '../components/layout/SalesLayout';
import TechnicianLayout from '../components/layout/TechnicianLayout';

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('../features/dashboard/pages/AdminDashboard'));
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
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage'));
const AuditLogsPage = lazy(() => import('../features/audit-logs/AuditLogsPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const ProfileOverviewPage = lazy(() => import('../features/profile/ProfileOverviewPage'));
const RolesPermissionsPage = lazy(() => import('../features/roles/RolesPermissionsPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));

// Lazy-loaded Future Role Portals
const PortalPlaceholderPage = lazy(() => import('../features/placeholder/PortalPlaceholderPage'));

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
const AssignedSurveysPage = lazy(() => import('../features/technician/pages/AssignedSurveysPage'));
const SurveyDetailsPage = lazy(() => import('../features/technician/pages/SurveyDetailsPage'));
const SurveySubmissionPage = lazy(() => import('../features/technician/pages/SurveySubmissionPage'));
const AssignedInstallationsPage = lazy(() => import('../features/technician/pages/AssignedInstallationsPage'));
const InstallationDetailsPage = lazy(() => import('../features/technician/pages/InstallationDetailsPage'));
const InstallationChecklistPage = lazy(() => import('../features/technician/pages/InstallationChecklistPage'));
const TechnicianProfilePage = lazy(() => import('../features/technician/pages/TechnicianProfilePage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
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
        path: 'notifications',
        element: <NotificationsPage />,
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
  {
    path: '/sales',
    element: <SalesLayout />,
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
  {
    path: '/warehouse',
    children: [
      {
        index: true,
        element: <Navigate to="/warehouse/dashboard" replace />,
      },
      {
        path: '*',
        element: <PortalPlaceholderPage type="warehouse" />,
      },
    ],
  },
  {
    path: '/technician',
    element: <TechnicianLayout />,
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
  {
    path: '/login',
    element: <LoginPage />,
  },
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
            href="/admin/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#0284C7] text-white rounded-lg text-sm font-semibold hover:bg-[#0369A1] transition"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);

export default router;
