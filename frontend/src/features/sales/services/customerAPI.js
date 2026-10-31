import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const customerAPI = {
  async getCustomers(params = {}) {
    if (useMock) {
      return storageService.getCustomers();
    }
    const response = await axiosInstance.get('/v1/sales/customers', { params });
    return response.data;
  },

  async getCustomerById(id) {
    if (useMock) {
      const customers = storageService.getCustomers();
      return customers.find((c) => c.id === id) || null;
    }
    const response = await axiosInstance.get(`/v1/sales/customers/${id}`);
    return response.data;
  },

  async createCustomer(customerData) {
    if (useMock) {
      return storageService.createCustomer(customerData);
    }
    const response = await axiosInstance.post('/v1/sales/customers', customerData);
    return response.data;
  },

  async updateCustomer(id, patch) {
    if (useMock) {
      return storageService.updateCustomer(id, patch);
    }
    const response = await axiosInstance.put(`/v1/sales/customers/${id}`, patch);
    return response.data;
  },

  async deleteCustomer(id) {
    if (useMock) {
      return storageService.deleteCustomer(id);
    }
    const response = await axiosInstance.delete(`/v1/sales/customers/${id}`);
    return response.data;
  },
};

export default customerAPI;

