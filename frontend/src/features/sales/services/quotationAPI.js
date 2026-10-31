import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const quotationAPI = {
  async getQuotations(params = {}) {
    if (useMock) {
      return storageService.getQuotations();
    }
    const response = await axiosInstance.get('/v1/sales/quotations', { params });
    return Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.data || []);
  },

  async getQuotationById(id) {
    if (useMock) {
      return storageService.getQuotationById(id);
    }
    const response = await axiosInstance.get(`/v1/sales/quotations/${id}`);
    return response.data?.data || response.data;
  },

  async createQuotation(quotationData) {
    if (useMock) {
      return storageService.createQuotation(quotationData);
    }
    const response = await axiosInstance.post('/v1/sales/quotations', quotationData);
    return response.data?.data || response.data;
  },

  async updateQuotation(id, patch) {
    if (useMock) {
      return storageService.updateQuotation(id, patch);
    }
    const response = await axiosInstance.put(`/v1/sales/quotations/${id}`, patch);
    return response.data?.data || response.data;
  },

  async submitQuotation(id) {
    if (useMock) {
      return storageService.updateQuotation(id, { approvalStatus: 'Pending', status: 'Submitted' });
    }
    const response = await axiosInstance.post(`/v1/sales/quotations/${id}/submit`);
    return response.data?.data || response.data;
  },

  async approveQuotation(id) {
    if (useMock) {
      return storageService.approveQuotation(id);
    }
    const response = await axiosInstance.post(`/v1/sales/quotations/${id}/approve`);
    return response.data?.data || response.data;
  },

  async acceptQuotation(id, convertToOrder = true) {
    if (useMock) {
      return storageService.acceptQuotation(id, convertToOrder);
    }
    const response = await axiosInstance.post(`/v1/sales/quotations/${id}/accept`, { convertToOrder });
    return response.data?.data || response.data;
  },

  async deleteQuotation(id) {
    if (useMock) {
      return storageService.deleteQuotation(id);
    }
    const response = await axiosInstance.delete(`/v1/sales/quotations/${id}`);
    return response.data?.data || response.data;
  },
};

export default quotationAPI;
