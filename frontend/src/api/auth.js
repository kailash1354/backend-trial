import API from './config';

// Auth API service
const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await API.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await API.post('/auth/verify-email', { token });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await API.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await API.put('/users/profile', userData);
    return response.data;
  },

  // Update password
  updatePassword: async (passwords) => {
    const response = await API.put('/users/password', passwords);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await API.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Add address
  addAddress: async (addressData) => {
    const response = await API.post('/users/addresses', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await API.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await API.delete(`/users/addresses/${addressId}`);
    return response.data;
  },
};

export default authAPI;