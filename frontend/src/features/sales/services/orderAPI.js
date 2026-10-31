import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const orderAPI = {
  async getOrders(params = {}) {
    if (useMock) {
      return storageService.getSalesOrders();
    }
    const response = await axiosInstance.get('/v1/sales/orders', { params });
    return Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.data || []);
  },

  async getOrderById(id) {
    if (useMock) {
      const orders = storageService.getSalesOrders();
      return orders.find((o) => o.id === id) || null;
    }
    const response = await axiosInstance.get(`/v1/sales/orders/${id}`);
    return response.data?.data || response.data;
  },

  async createOrder(orderData) {
    if (useMock) {
      return storageService.createSalesOrder(orderData);
    }
    const response = await axiosInstance.post('/v1/sales/orders', orderData);
    return response.data?.data || response.data;
  },

  async updateOrderStatus(id, newStatus) {
    if (useMock) {
      return storageService.updateSalesOrder(id, { orderStatus: newStatus });
    }
    const response = await axiosInstance.patch(`/v1/sales/orders/${id}/status`, {
      status: newStatus,
    });
    return response.data?.data || response.data;
  },
};

export default orderAPI;
