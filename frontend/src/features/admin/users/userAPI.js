import axiosInstance from '../../../services/axiosInstance';

export const userAPI = {
  // Fetch paginated, searchable, filterable users list
  async getUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.page_size) query.append('page_size', params.page_size);
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'all') query.append('role', params.role);
    if (params.account_status && params.account_status !== 'all') {
      query.append('account_status', params.account_status);
    }

    const response = await axiosInstance.get(`/users?${query.toString()}`);
    return response.data?.data || response.data;
  },

  // Approve a pending user and assign their operational role
  async approveUser(userId, { role, permissions }) {
    const response = await axiosInstance.post(`/users/${userId}/approve`, {
      role,
      permissions,
    });
    return response.data?.data || response.data;
  },

  // Reject a user application
  async rejectUser(userId, { reason }) {
    const response = await axiosInstance.post(`/users/${userId}/reject`, {
      reason,
    });
    return response.data?.data || response.data;
  },

  // Suspend an active user
  async suspendUser(userId, { reason }) {
    const response = await axiosInstance.post(`/users/${userId}/suspend`, {
      reason,
    });
    return response.data?.data || response.data;
  },

  // Reactivate a suspended user
  async reactivateUser(userId) {
    const response = await axiosInstance.post(`/users/${userId}/reactivate`);
    return response.data?.data || response.data;
  },
};

export default userAPI;
