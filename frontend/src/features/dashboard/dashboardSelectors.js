import { createSelector } from '@reduxjs/toolkit';

// Base Selector
export const selectDashboardState = (state) => state.dashboard;

// KPI Stats Selectors
export const selectDashboardStats = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.stats
);

// Derived Financial Summary calculation memoized
export const selectFinancialSummary = createSelector(
  [selectDashboardStats],
  (stats) => {
    if (!stats.data) return null;
    const { totalRevenue, paymentsReceived, outstandingPayments } = stats.data;
    const rev = totalRevenue?.value || 0;
    const rec = paymentsReceived?.value || 0;
    const collectionRate = rev > 0 ? Math.round((rec / rev) * 100) : 0;

    return {
      totalRevenue: rev,
      paymentsReceived: rec,
      outstandingPayments: outstandingPayments?.value || 0,
      collectionRate,
    };
  }
);

// Revenue Analytics
export const selectRevenueAnalytics = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.revenueAnalytics
);

// Project Analytics
export const selectProjectAnalytics = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.projectAnalytics
);

// Installation Analytics
export const selectInstallationAnalytics = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.installationAnalytics
);

// Inventory Analytics
export const selectInventoryAnalytics = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.inventoryAnalytics
);

// Operational Alerts
export const selectOperationalAlertsState = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.operationalAlerts
);

// Memoized Operational Alerts Sorted by Priority: Critical -> Warning -> Info
export const selectSortedAlerts = createSelector(
  [selectOperationalAlertsState],
  (alertsState) => {
    if (!alertsState.data || alertsState.data.length === 0) return [];

    const severityOrder = {
      critical: 1,
      warning: 2,
      info: 3,
    };

    return [...alertsState.data].sort((a, b) => {
      const orderA = severityOrder[a.severity] || 99;
      const orderB = severityOrder[b.severity] || 99;
      return orderA - orderB;
    });
  }
);

// Recent Projects Selectors
export const selectRecentProjects = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.projects
);

// Recent Payments Selectors
export const selectRecentPayments = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.payments
);

// Recent Enquiries Selectors
export const selectRecentEnquiries = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.enquiries
);

// Recent Service Tickets Selectors
export const selectRecentServiceTickets = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.serviceTickets
);

// Recent Activity Selectors
export const selectRecentActivity = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.activity
);

