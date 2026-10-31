import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const salesAPI = {
  async getSalesStats() {
    if (useMock) {
      return storageService.getSalesStats();
    }
    const response = await axiosInstance.get('/v1/sales/stats');
    return response.data;
  },

  async getSalesAnalytics() {
    if (useMock) {
      return storageService.getSalesAnalytics();
    }
    const response = await axiosInstance.get('/v1/sales/analytics');
    return response.data;
  },

  async getUpcomingFollowUps() {
    if (useMock) {
      const all = storageService.getFollowUps();
      return all.filter((f) => f.status === 'Pending' || f.status === 'Overdue');
    }
    const response = await axiosInstance.get('/v1/sales/follow-ups', {
      params: { filter: 'upcoming' },
    });
    return response.data;
  },

  async getSalesActivities() {
    if (useMock) {
      const all = storageService.getActivities();
      return all.filter((a) =>
        ['Enquiries', 'Customers', 'Sales Follow-ups', 'Site Surveys', 'Quotations', 'Sales Orders'].includes(
          a.module
        )
      );
    }
    const response = await axiosInstance.get('/v1/sales/activities');
    return response.data;
  },
};

export default salesAPI;

