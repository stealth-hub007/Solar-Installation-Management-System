import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const followUpAPI = {
  async getFollowUps(params = {}) {
    if (useMock) {
      return storageService.getFollowUps();
    }
    const response = await axiosInstance.get('/v1/sales/follow-ups', { params });
    return Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.data || []);
  },

  async createFollowUp(followUpData) {
    if (useMock) {
      return storageService.createFollowUp(followUpData);
    }
    const response = await axiosInstance.post('/v1/sales/follow-ups', followUpData);
    return response.data?.data || response.data;
  },

  async updateFollowUp(id, patch) {
    if (useMock) {
      return storageService.updateFollowUp(id, patch);
    }
    const response = await axiosInstance.put(`/v1/sales/follow-ups/${id}`, patch);
    return response.data?.data || response.data;
  },

  async completeFollowUp(id, outcomeNotes) {
    if (useMock) {
      return storageService.completeFollowUp(id, outcomeNotes);
    }
    const response = await axiosInstance.patch(`/v1/sales/follow-ups/${id}/complete`, { outcomeNotes });
    return response.data?.data || response.data;
  },

  async rescheduleFollowUp(id, newDate, newTime, notes) {
    if (useMock) {
      return storageService.rescheduleFollowUp(id, newDate, newTime, notes);
    }
    const response = await axiosInstance.patch(`/v1/sales/follow-ups/${id}/reschedule`, {
      followUpDate: newDate,
      followUpTime: newTime,
      notes,
    });
    return response.data?.data || response.data;
  },

  async deleteFollowUp(id) {
    if (useMock) {
      return storageService.deleteFollowUp(id);
    }
    const response = await axiosInstance.delete(`/v1/sales/follow-ups/${id}`);
    return response.data?.data || response.data;
  },
};

export default followUpAPI;
