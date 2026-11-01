import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardStats,
  fetchRevenueAnalytics,
  fetchProjectAnalytics,
  fetchInstallationAnalytics,
  fetchInventoryAnalytics,
  fetchRecentProjects,
  fetchRecentPayments,
  fetchRecentEnquiries,
  fetchRecentServiceTickets,
  fetchRecentActivity,
  createProject,
  updateProject,
  deleteProject,
  createPayment,
  updatePayment,
  deletePayment,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  createServiceTicket,
  updateServiceTicket,
  deleteServiceTicket,
  resetAllData,
  setStatsTimeRange,
  setRevenuePeriod,
  setProjectsFilters,
  setProjectsPagination,
  resetProjectsFilters,
  setPaymentsFilters,
  setPaymentsPagination,
  resetPaymentsFilters,
  setEnquiriesFilters,
  setEnquiriesPagination,
  resetEnquiriesFilters,
  setServiceTicketsFilters,
  setServiceTicketsPagination,
  resetServiceTicketsFilters,
  setActivityFilters,
  setActivityPagination,
  resetActivityFilters,
} from '../dashboardSlice';

import {
  selectDashboardStats,
  selectRevenueAnalytics,
  selectProjectAnalytics,
  selectInstallationAnalytics,
  selectInventoryAnalytics,
  selectRecentProjects,
  selectRecentPayments,
  selectRecentEnquiries,
  selectRecentServiceTickets,
  selectRecentActivity,
} from '../dashboardSelectors';

import PageContainer from '../../../components/layout/PageContainer';
import DashboardWelcome from '../components/DashboardWelcome';
import DashboardStats from '../components/DashboardStats';
import RevenueChart from '../components/RevenueChart';
import ProjectStatusChart from '../components/ProjectStatusChart';
import InstallationChart from '../components/InstallationChart';
import InventoryChart from '../components/InventoryChart';
import RecentProjects from '../components/RecentProjects';
import RecentPayments from '../components/RecentPayments';
import RecentEnquiries from '../components/RecentEnquiries';
import RecentServiceTickets from '../components/RecentServiceTickets';
import RecentActivity from '../components/RecentActivity';

import {
  FolderKanban,
  CreditCard,
  MessageSquareMore,
  Headphones,
  Activity,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Active table tab state
  const [activeTableTab, setActiveTableTab] = useState('projects');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const checkPendingUsers = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/users?account_status=PENDING&size=10');
      const items = res.data?.data?.items || res.data?.data || [];
      setPendingApprovalsCount(Array.isArray(items) ? items.length : 0);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    checkPendingUsers();
  }, [checkPendingUsers]);

  const reduxUser = useSelector((state) => state.auth?.user);
  const authUser = reduxUser || (() => {
    try {
      const saved = localStorage.getItem('sims_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })() || { full_name: 'Administrator', role: 'ADMIN' };

  const activeAdminName = authUser.full_name || authUser.name || 'Administrator';

  // Redux Selectors
  const statsState = useSelector(selectDashboardStats);
  const revenueState = useSelector(selectRevenueAnalytics);
  const projectState = useSelector(selectProjectAnalytics);
  const installationState = useSelector(selectInstallationAnalytics);
  const inventoryState = useSelector(selectInventoryAnalytics);
  const projectsState = useSelector(selectRecentProjects);
  const paymentsState = useSelector(selectRecentPayments);
  const enquiriesState = useSelector(selectRecentEnquiries);
  const serviceTicketsState = useSelector(selectRecentServiceTickets);
  const activityState = useSelector(selectRecentActivity);

  // Initial Data Fetching
  const loadAllDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchDashboardStats({ timeRange: statsState.timeRange })),
        dispatch(fetchRevenueAnalytics(revenueState.period)),
        dispatch(fetchProjectAnalytics()),
        dispatch(fetchInstallationAnalytics()),
        dispatch(fetchInventoryAnalytics()),
        dispatch(
          fetchRecentProjects({
            page: projectsState.pagination.page,
            pageSize: projectsState.pagination.pageSize,
            search: projectsState.filters.search,
            status: projectsState.filters.status,
            sortBy: projectsState.filters.sortBy,
            sortDirection: projectsState.filters.sortDirection,
          })
        ),
        dispatch(
          fetchRecentPayments({
            page: paymentsState.pagination.page,
            pageSize: paymentsState.pagination.pageSize,
            search: paymentsState.filters.search,
            status: paymentsState.filters.status,
            sortBy: paymentsState.filters.sortBy,
            sortDirection: paymentsState.filters.sortDirection,
          })
        ),
        dispatch(
          fetchRecentEnquiries({
            page: enquiriesState.pagination.page,
            pageSize: enquiriesState.pagination.pageSize,
            search: enquiriesState.filters.search,
            status: enquiriesState.filters.status,
            sortBy: enquiriesState.filters.sortBy,
            sortDirection: enquiriesState.filters.sortDirection,
          })
        ),
        dispatch(
          fetchRecentServiceTickets({
            page: serviceTicketsState.pagination.page,
            pageSize: serviceTicketsState.pagination.pageSize,
            search: serviceTicketsState.filters.search,
            priority: serviceTicketsState.filters.priority,
            sortBy: serviceTicketsState.filters.sortBy,
            sortDirection: serviceTicketsState.filters.sortDirection,
          })
        ),
        dispatch(
          fetchRecentActivity({
            page: activityState.pagination.page,
            pageSize: activityState.pagination.pageSize,
            search: activityState.filters.search,
            module: activityState.filters.module,
            sortBy: activityState.filters.sortBy,
            sortDirection: activityState.filters.sortDirection,
          })
        ),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    dispatch,
    statsState.timeRange,
    revenueState.period,
  ]);

  useEffect(() => {
    loadAllDashboardData();
  }, [loadAllDashboardData]);

  // Project Table Listeners
  useEffect(() => {
    dispatch(
      fetchRecentProjects({
        page: projectsState.pagination.page,
        pageSize: projectsState.pagination.pageSize,
        search: projectsState.filters.search,
        status: projectsState.filters.status,
        sortBy: projectsState.filters.sortBy,
        sortDirection: projectsState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    projectsState.pagination.page,
    projectsState.pagination.pageSize,
    projectsState.filters.search,
    projectsState.filters.status,
    projectsState.filters.sortBy,
    projectsState.filters.sortDirection,
  ]);

  // Payments Table Listeners
  useEffect(() => {
    dispatch(
      fetchRecentPayments({
        page: paymentsState.pagination.page,
        pageSize: paymentsState.pagination.pageSize,
        search: paymentsState.filters.search,
        status: paymentsState.filters.status,
        sortBy: paymentsState.filters.sortBy,
        sortDirection: paymentsState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    paymentsState.pagination.page,
    paymentsState.pagination.pageSize,
    paymentsState.filters.search,
    paymentsState.filters.status,
    paymentsState.filters.sortBy,
    paymentsState.filters.sortDirection,
  ]);

  // Enquiries Table Listeners
  useEffect(() => {
    dispatch(
      fetchRecentEnquiries({
        page: enquiriesState.pagination.page,
        pageSize: enquiriesState.pagination.pageSize,
        search: enquiriesState.filters.search,
        status: enquiriesState.filters.status,
        sortBy: enquiriesState.filters.sortBy,
        sortDirection: enquiriesState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    enquiriesState.pagination.page,
    enquiriesState.pagination.pageSize,
    enquiriesState.filters.search,
    enquiriesState.filters.status,
    enquiriesState.filters.sortBy,
    enquiriesState.filters.sortDirection,
  ]);

  // Service Tickets Table Listeners
  useEffect(() => {
    dispatch(
      fetchRecentServiceTickets({
        page: serviceTicketsState.pagination.page,
        pageSize: serviceTicketsState.pagination.pageSize,
        search: serviceTicketsState.filters.search,
        priority: serviceTicketsState.filters.priority,
        sortBy: serviceTicketsState.filters.sortBy,
        sortDirection: serviceTicketsState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    serviceTicketsState.pagination.page,
    serviceTicketsState.pagination.pageSize,
    serviceTicketsState.filters.search,
    serviceTicketsState.filters.priority,
    serviceTicketsState.filters.sortBy,
    serviceTicketsState.filters.sortDirection,
  ]);

  // Activity Table Listeners
  useEffect(() => {
    dispatch(
      fetchRecentActivity({
        page: activityState.pagination.page,
        pageSize: activityState.pagination.pageSize,
        search: activityState.filters.search,
        module: activityState.filters.module,
        sortBy: activityState.filters.sortBy,
        sortDirection: activityState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    activityState.pagination.page,
    activityState.pagination.pageSize,
    activityState.filters.search,
    activityState.filters.module,
    activityState.filters.sortBy,
    activityState.filters.sortDirection,
  ]);

  // Handlers for KPIs & Filters
  const handleTimeRangeChange = (range) => {
    dispatch(setStatsTimeRange(range));
    dispatch(fetchDashboardStats({ timeRange: range }));
    // Synchronize revenue chart with the selected time period
    dispatch(setRevenuePeriod(range));
    dispatch(fetchRevenueAnalytics(range));
  };

  const handleRevenuePeriodChange = (period) => {
    dispatch(setRevenuePeriod(period));
    dispatch(fetchRevenueAnalytics(period));
  };

  // CRUD Handlers for Projects
  const handleCreateProject = async (data) => {
    await dispatch(createProject(data));
    dispatch(fetchRecentProjects(projectsState.pagination));
  };

  const handleUpdateProject = async ({ id, data }) => {
    await dispatch(updateProject({ id, data }));
    dispatch(fetchRecentProjects(projectsState.pagination));
  };

  const handleDeleteProject = async (id) => {
    await dispatch(deleteProject(id));
    dispatch(fetchRecentProjects(projectsState.pagination));
  };

  // CRUD Handlers for Payments
  const handleCreatePayment = async (data) => {
    await dispatch(createPayment(data));
    dispatch(fetchRecentPayments(paymentsState.pagination));
  };

  const handleUpdatePayment = async ({ id, data }) => {
    await dispatch(updatePayment({ id, data }));
    dispatch(fetchRecentPayments(paymentsState.pagination));
  };

  const handleDeletePayment = async (id) => {
    await dispatch(deletePayment(id));
    dispatch(fetchRecentPayments(paymentsState.pagination));
  };

  // CRUD Handlers for Enquiries
  const handleCreateEnquiry = async (data) => {
    await dispatch(createEnquiry(data));
    dispatch(fetchRecentEnquiries(enquiriesState.pagination));
  };

  const handleUpdateEnquiry = async ({ id, data }) => {
    await dispatch(updateEnquiry({ id, data }));
    dispatch(fetchRecentEnquiries(enquiriesState.pagination));
  };

  const handleDeleteEnquiry = async (id) => {
    await dispatch(deleteEnquiry(id));
    dispatch(fetchRecentEnquiries(enquiriesState.pagination));
  };

  // CRUD Handlers for Service Tickets
  const handleCreateTicket = async (data) => {
    await dispatch(createServiceTicket(data));
    dispatch(fetchRecentServiceTickets(serviceTicketsState.pagination));
  };

  const handleUpdateTicket = async ({ id, data }) => {
    await dispatch(updateServiceTicket({ id, data }));
    dispatch(fetchRecentServiceTickets(serviceTicketsState.pagination));
  };

  const handleDeleteTicket = async (id) => {
    await dispatch(deleteServiceTicket(id));
    dispatch(fetchRecentServiceTickets(serviceTicketsState.pagination));
  };

  const tableTabs = [
    { id: 'projects', label: 'Recent Projects', icon: FolderKanban, count: projectsState.pagination.totalRecords },
    { id: 'payments', label: 'Recent Payments', icon: CreditCard, count: paymentsState.pagination.totalRecords },
    { id: 'enquiries', label: 'Recent Enquiries', icon: MessageSquareMore, count: enquiriesState.pagination.totalRecords },
    { id: 'serviceTickets', label: 'Service Tickets', icon: Headphones, count: serviceTicketsState.pagination.totalRecords },
    { id: 'activity', label: 'Recent Activity', icon: Activity, count: activityState.pagination.totalRecords },
  ];

  return (
    <PageContainer>
      {/* 1. Dashboard Welcome Banner */}
      <DashboardWelcome
        adminName={activeAdminName}
        timeRange={statsState.timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={loadAllDashboardData}
        isRefreshing={isRefreshing}
      />

      {/* 2. Executive KPI Cards (9 Metrics) */}
      <section aria-label="Executive KPI Overview">
        <DashboardStats
          stats={statsState.data}
          isLoading={statsState.isLoading}
          error={statsState.error}
          onRetry={() => dispatch(fetchDashboardStats({ timeRange: statsState.timeRange }))}
        />
      </section>

      {/* 3. Analytics Charts Grid */}
      <section aria-label="Operations and Financial Analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Revenue Analytics */}
        <RevenueChart
          data={revenueState.data}
          period={revenueState.period}
          onPeriodChange={handleRevenuePeriodChange}
          isLoading={revenueState.isLoading}
          error={revenueState.error}
          onRetry={() => dispatch(fetchRevenueAnalytics(revenueState.period))}
        />

        {/* B. Project Status Distribution */}
        <ProjectStatusChart
          data={projectState.data}
          isLoading={projectState.isLoading}
          error={projectState.error}
          onRetry={() => dispatch(fetchProjectAnalytics())}
        />

        {/* C. Installation Velocity */}
        <InstallationChart
          data={installationState.data}
          isLoading={installationState.isLoading}
          error={installationState.error}
          onRetry={() => dispatch(fetchInstallationAnalytics())}
        />

        {/* D. Inventory Thresholds */}
        <InventoryChart
          data={inventoryState.data}
          isLoading={inventoryState.isLoading}
          error={inventoryState.error}
          onRetry={() => dispatch(fetchInventoryAnalytics())}
        />
      </section>

      {/* 5. Data Records & Operations Tables */}
      <section aria-label="Operational Data Records" className="space-y-4">
        {/* Navigation Tabs for 5 Operational Tables */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
          {tableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTableTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTableTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-[#0284C7] text-[#0284C7] bg-sky-50/70 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0284C7]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Recent Projects */}
        {activeTableTab === 'projects' && (
          <RecentProjects
            data={projectsState.data}
            pagination={projectsState.pagination}
            filters={projectsState.filters}
            isLoading={projectsState.isLoading}
            error={projectsState.error}
            onPageChange={(page) => dispatch(setProjectsPagination({ page }))}
            onPageSizeChange={(pageSize) => dispatch(setProjectsPagination({ pageSize, page: 1 }))}
            onFiltersChange={(filters) => dispatch(setProjectsFilters(filters))}
            onResetFilters={() => dispatch(resetProjectsFilters())}
            onRetry={() => dispatch(fetchRecentProjects())}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {/* Tab 2: Recent Payments */}
        {activeTableTab === 'payments' && (
          <RecentPayments
            data={paymentsState.data}
            pagination={paymentsState.pagination}
            filters={paymentsState.filters}
            isLoading={paymentsState.isLoading}
            error={paymentsState.error}
            onPageChange={(page) => dispatch(setPaymentsPagination({ page }))}
            onPageSizeChange={(pageSize) => dispatch(setPaymentsPagination({ pageSize, page: 1 }))}
            onFiltersChange={(filters) => dispatch(setPaymentsFilters(filters))}
            onResetFilters={() => dispatch(resetPaymentsFilters())}
            onRetry={() => dispatch(fetchRecentPayments())}
            onDeletePayment={handleDeletePayment}
          />
        )}

        {/* Tab 3: Recent Enquiries */}
        {activeTableTab === 'enquiries' && (
          <RecentEnquiries
            data={enquiriesState.data}
            pagination={enquiriesState.pagination}
            filters={enquiriesState.filters}
            isLoading={enquiriesState.isLoading}
            error={enquiriesState.error}
            onPageChange={(page) => dispatch(setEnquiriesPagination({ page }))}
            onPageSizeChange={(pageSize) => dispatch(setEnquiriesPagination({ pageSize, page: 1 }))}
            onFiltersChange={(filters) => dispatch(setEnquiriesFilters(filters))}
            onResetFilters={() => dispatch(resetEnquiriesFilters())}
            onRetry={() => dispatch(fetchRecentEnquiries())}
            onCreateEnquiry={handleCreateEnquiry}
            onUpdateEnquiry={handleUpdateEnquiry}
            onDeleteEnquiry={handleDeleteEnquiry}
          />
        )}

        {/* Tab 4: Recent Service Tickets */}
        {activeTableTab === 'serviceTickets' && (
          <RecentServiceTickets
            data={serviceTicketsState.data}
            pagination={serviceTicketsState.pagination}
            filters={serviceTicketsState.filters}
            isLoading={serviceTicketsState.isLoading}
            error={serviceTicketsState.error}
            onPageChange={(page) => dispatch(setServiceTicketsPagination({ page }))}
            onPageSizeChange={(pageSize) => dispatch(setServiceTicketsPagination({ pageSize, page: 1 }))}
            onFiltersChange={(filters) => dispatch(setServiceTicketsFilters(filters))}
            onResetFilters={() => dispatch(resetServiceTicketsFilters())}
            onRetry={() => dispatch(fetchRecentServiceTickets())}
            onDeleteTicket={handleDeleteTicket}
          />
        )}

        {/* Tab 5: Recent Activity */}
        {activeTableTab === 'activity' && (
          <RecentActivity
            data={activityState.data}
            pagination={activityState.pagination}
            filters={activityState.filters}
            isLoading={activityState.isLoading}
            error={activityState.error}
            onPageChange={(page) => dispatch(setActivityPagination({ page }))}
            onPageSizeChange={(pageSize) => dispatch(setActivityPagination({ pageSize, page: 1 }))}
            onFiltersChange={(filters) => dispatch(setActivityFilters(filters))}
            onResetFilters={() => dispatch(resetActivityFilters())}
            onRetry={() => dispatch(fetchRecentActivity())}
          />
        )}
      </section>
    </PageContainer>
  );
};

export default AdminDashboard;
