import axiosInstance from '../../services/axiosInstance';
import storageService from '../../services/storageService';
import { paginateCollection } from '../../services/mockData';

// Check whether to use development-isolated mock / localStorage layer
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Helper to simulate minor async delay for smooth UI transition
const asyncDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardAPI = {
  // --------------------------------------------------------------------------
  // EXECUTIVE KPIS & ANALYTICS
  // --------------------------------------------------------------------------
  async getDashboardStats(params = {}) {
    if (USE_MOCK) {
      await asyncDelay();
      const stats = storageService.getStats(params.timeRange);
      return { success: true, data: stats };
    }
    const response = await axiosInstance.get('/dashboard/stats', { params });
    return response.data;
  },

  async getRevenueAnalytics(period = '12m') {
    if (USE_MOCK) {
      await asyncDelay();
      const series = storageService.getRevenueAnalytics(period);
      return { success: true, data: series };
    }
    const response = await axiosInstance.get('/dashboard/analytics/revenue', { params: { period } });
    return response.data;
  },

  async getProjectAnalytics() {
    if (USE_MOCK) {
      await asyncDelay();
      const dist = storageService.getProjectAnalytics();
      return { success: true, data: dist };
    }
    const response = await axiosInstance.get('/dashboard/analytics/project-status');
    return response.data;
  },

  async getInstallationAnalytics() {
    if (USE_MOCK) {
      await asyncDelay();
      const data = storageService.getInstallationAnalytics();
      return { success: true, data };
    }
    const response = await axiosInstance.get('/dashboard/analytics/installations');
    return response.data;
  },

  async getInventoryAnalytics() {
    if (USE_MOCK) {
      await asyncDelay();
      const data = storageService.getInventory();
      return { success: true, data };
    }
    const response = await axiosInstance.get('/dashboard/analytics/inventory');
    return response.data;
  },

  // --------------------------------------------------------------------------
  // OPERATIONAL ALERTS
  // --------------------------------------------------------------------------
  async getOperationalAlerts(params = {}) {
    if (USE_MOCK) {
      await asyncDelay();
      let alerts = storageService.getAlerts();
      if (params.severity && params.severity !== 'all') {
        alerts = alerts.filter((a) => a.severity === params.severity);
      }
      return { success: true, data: alerts };
    }
    const response = await axiosInstance.get('/dashboard/alerts', { params });
    return response.data;
  },

  async createAlert(alertData) {
    if (USE_MOCK) {
      await asyncDelay();
      const created = storageService.createAlert(alertData);
      return { success: true, data: created };
    }
    const response = await axiosInstance.post('/dashboard/alerts', alertData);
    return response.data;
  },

  async deleteAlert(id) {
    if (USE_MOCK) {
      await asyncDelay();
      const res = storageService.deleteAlert(id);
      return { success: true, data: res };
    }
    const response = await axiosInstance.delete(`/dashboard/alerts/${id}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // PROJECTS CRUD
  // --------------------------------------------------------------------------
  async getRecentProjects(params = {}) {
    if (USE_MOCK) {
      await asyncDelay();
      const projects = storageService.getProjects();
      return paginateCollection(projects, {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
        filterKey: 'status',
        filterVal: params.status,
        sortBy: params.sortBy || 'createdDate',
        sortDirection: params.sortDirection || 'desc',
      });
    }
    const response = await axiosInstance.get('/dashboard/recent-projects', { params });
    return response.data;
  },

  async createProject(projectData) {
    if (USE_MOCK) {
      await asyncDelay();
      const created = storageService.createProject(projectData);
      return { success: true, data: created };
    }
    const response = await axiosInstance.post('/projects', projectData);
    return response.data;
  },

  async updateProject(id, projectData) {
    if (USE_MOCK) {
      await asyncDelay();
      const updated = storageService.updateProject(id, projectData);
      return { success: true, data: updated };
    }
    const response = await axiosInstance.put(`/projects/${id}`, projectData);
    return response.data;
  },

  async deleteProject(id) {
    if (USE_MOCK) {
      await asyncDelay();
      const res = storageService.deleteProject(id);
      return { success: true, data: res };
    }
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // PAYMENTS CRUD
  // --------------------------------------------------------------------------
  async getRecentPayments(params = {}) {
    if (USE_MOCK) {
      await asyncDelay();
      const payments = storageService.getPayments();
      return paginateCollection(payments, {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
        filterKey: 'paymentStatus',
        filterVal: params.status,
        sortBy: params.sortBy || 'paymentDate',
        sortDirection: params.sortDirection || 'desc',
      });
    }
    const response = await axiosInstance.get('/dashboard/recent-payments', { params });
    return response.data;
  },

  async createPayment(paymentData) {
    if (USE_MOCK) {
      await asyncDelay();
      const created = storageService.createPayment(paymentData);
      return { success: true, data: created };
    }
    const response = await axiosInstance.post('/payments', paymentData);
    return response.data;
  },

  async updatePayment(id, paymentData) {
    if (USE_MOCK) {
      await asyncDelay();
      const updated = storageService.updatePayment(id, paymentData);
      return { success: true, data: updated };
    }
    const response = await axiosInstance.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  async deletePayment(id) {
    if (USE_MOCK) {
      await asyncDelay();
      const res = storageService.deletePayment(id);
      return { success: true, data: res };
    }
    const response = await axiosInstance.delete(`/payments/${id}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // ENQUIRIES CRUD
  // --------------------------------------------------------------------------
  async getRecentEnquiries(params = {}) {
    if (USE_MOCK) {
      await asyncDelay();
      const enquiries = storageService.getEnquiries();
      return paginateCollection(enquiries, {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
        filterKey: 'enquiryStatus',
        filterVal: params.status,
        sortBy: params.sortBy || 'createdDate',
        sortDirection: params.sortDirection || 'desc',
      });
    }
    const response = await axiosInstance.get('/dashboard/recent-enquiries', { params });
    return response.data;
  },

  async createEnquiry(enquiryData) {
    if (USE_MOCK) {
      await asyncDelay();
      const created = storageService.createEnquiry(enquiryData);
      return { success: true, data: created };
    }
    const response = await axiosInstance.post('/enquiries', enquiryData);
    return response.data;
  },

  async updateEnquiry(id, enquiryData) {
    if (USE_MOCK) {
      await asyncDelay();
      const updated = storageService.updateEnquiry(id, enquiryData);
      return { success: true, data: updated };
    }
    const response = await axiosInstance.put(`/enquiries/${id}`, enquiryData);
    return response.data;
  },

  async deleteEnquiry(id) {
    if (USE_MOCK) {
      await asyncDelay();
      const res = storageService.deleteEnquiry(id);
      return { success: true, data: res };
    }
    const response = await axiosInstance.delete(`/enquiries/${id}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // SERVICE TICKETS CRUD
  // --------------------------------------------------------------------------
  async getRecentServiceTickets(params = {}) {
    if (USE_MOCK) {
      await asyncDelay();
      const tickets = storageService.getServiceTickets();
      return paginateCollection(tickets, {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
        filterKey: 'priority',
        filterVal: params.priority,
        sortBy: params.sortBy || 'createdDate',
        sortDirection: params.sortDirection || 'desc',
      });
    }
    const response = await axiosInstance.get('/dashboard/recent-service-tickets', { params });
    return response.data;
  },

  async createServiceTicket(ticketData) {
    if (USE_MOCK) {
      await asyncDelay();
      const created = storageService.createServiceTicket(ticketData);
      return { success: true, data: created };
    }
    const response = await axiosInstance.post('/service-tickets', ticketData);
    return response.data;
  },

  async updateServiceTicket(id, ticketData) {
    if (USE_MOCK) {
      await asyncDelay();
      const updated = storageService.updateServiceTicket(id, ticketData);
      return { success: true, data: updated };
    }
    const response = await axiosInstance.put(`/service-tickets/${id}`, ticketData);
    return response.data;
  },

  async deleteServiceTicket(id) {
    if (USE_MOCK) {
      await asyncDelay();
      const res = storageService.deleteServiceTicket(id);
      return { success: true, data: res };
    }
    const response = await axiosInstance.delete(`/service-tickets/${id}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // AUDIT TRAIL ACTIVITY
  // --------------------------------------------------------------------------
  async getRecentActivity(params = {}) {
    if (USE_MOCK) {
      await asyncDelay();
      const activities = storageService.getActivities();
      return paginateCollection(activities, {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
        filterKey: 'module',
        filterVal: params.module,
        sortBy: params.sortBy || 'timestamp',
        sortDirection: params.sortDirection || 'desc',
      });
    }
    const response = await axiosInstance.get('/dashboard/recent-activity', { params });
    return response.data;
  },

  // --------------------------------------------------------------------------
  // RESET ALL SAMPLE DATA
  // --------------------------------------------------------------------------
  async resetAllSampleData() {
    if (USE_MOCK) {
      await asyncDelay(300);
      storageService.resetToDefaults();
      return { success: true };
    }
    const response = await axiosInstance.post('/system/reset-demo-data');
    return response.data;
  },
};

export default dashboardAPI;
