import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const enquiryAPI = {
  async getEnquiries(params = {}) {
    if (useMock) {
      return storageService.getEnquiries();
    }
    const response = await axiosInstance.get('/v1/sales/enquiries', { params });
    return response.data;
  },

  async getEnquiryById(id) {
    if (useMock) {
      const enquiries = storageService.getEnquiries();
      return enquiries.find((e) => e.id === id) || null;
    }
    const response = await axiosInstance.get(`/v1/sales/enquiries/${id}`);
    return response.data;
  },

  async createEnquiry(enquiryData) {
    if (useMock) {
      return storageService.createEnquiry(enquiryData);
    }
    const response = await axiosInstance.post('/v1/sales/enquiries', enquiryData);
    return response.data;
  },

  async updateEnquiry(id, patch) {
    if (useMock) {
      return storageService.updateEnquiry(id, patch);
    }
    const response = await axiosInstance.put(`/v1/sales/enquiries/${id}`, patch);
    return response.data;
  },

  async updateEnquiryStatus(id, newStatus) {
    if (useMock) {
      return storageService.updateEnquiry(id, { enquiryStatus: newStatus });
    }
    const response = await axiosInstance.patch(`/v1/sales/enquiries/${id}/status`, { status: newStatus });
    return response.data;
  },

  async deleteEnquiry(id) {
    if (useMock) {
      return storageService.deleteEnquiry(id);
    }
    const response = await axiosInstance.delete(`/v1/sales/enquiries/${id}`);
    return response.data;
  },
};

export default enquiryAPI;

