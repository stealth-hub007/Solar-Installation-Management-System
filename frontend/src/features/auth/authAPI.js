import axiosInstance from '../../services/axiosInstance';

export const authAPI = {
  // Login with email and password
  async login({ email, password }) {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data?.data || response.data;
  },

  // Sign in alias
  async signin({ email, password }) {
    const response = await axiosInstance.post('/auth/signin', { email, password });
    return response.data?.data || response.data;
  },

  // Public user registration
  async register({ full_name, email, password, confirm_password, phone, role }) {
    const response = await axiosInstance.post('/auth/register', {
      full_name,
      email,
      password,
      confirm_password,
      phone,
      role,
    });
    return response.data?.data || response.data;
  },

  // Google OAuth authentication / verification
  async googleAuth(payload) {
    const response = await axiosInstance.post('/auth/google', payload);
    return response.data?.data || response.data;
  },

  // Get profile of current authenticated user
  async getCurrentUser() {
    const response = await axiosInstance.get('/auth/me');
    return response.data?.data || response.data;
  },

  // Check account status and assigned permissions
  async checkStatus() {
    const response = await axiosInstance.get('/auth/status');
    return response.data?.data || response.data;
  },

  // Logout session
  async logout() {
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    return true;
  },
};

export default authAPI;
