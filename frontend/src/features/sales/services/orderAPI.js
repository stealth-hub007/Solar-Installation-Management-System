import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const orderAPI = {
  async getOrders(params = {}) {
    if (useMock) {
      return storageService.getOrders();
    }
    const response = await axiosInstance.get('/v1/sales/orders', { params });
    return response.data;
  },

  async getOrderById(id) {
    if (useMock) {
      return storageService.getOrderById(id);
    }
    const response = await axiosInstance.get(`/v1/sales/orders/${id}`);
    return response.data;
  },

  async createOrder(orderData) {
    if (useMock) {
      return storageService.createOrder(orderData);
    }
    const response = await axiosInstance.post('/v1/sales/orders', orderData);
    return response.data;
  },

  async updateOrderStatus(id, status, milestoneIndex = null) {
    if (useMock) {
      return storageService.updateOrderStatus(id, status, milestoneIndex);
    }
    const response = await axiosInstance.patch(`/v1/sales/orders/${id}/status`, {
      status,
      milestoneIndex,
    });
    return response.data;
  },
};

export default orderAPI;

