import API from './config';

// Orders API service
const ordersAPI = {
  // Create order
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },

  // Get user orders
  getOrders: async (params = {}) => {
    const response = await API.get('/orders', { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id) => {
    const response = await API.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await API.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Get order statistics (Admin)
  getOrderStats: async (params = {}) => {
    const response = await API.get('/orders/admin/stats', { params });
    return response.data;
  },

  // Get all orders (Admin)
  getAllOrders: async (params = {}) => {
    const response = await API.get('/orders/admin/all', { params });
    return response.data;
  },

  // Update order status (Admin)
  updateOrderStatus: async (id, statusData) => {
    const response = await API.put(`/orders/${id}/status`, statusData);
    return response.data;
  },
};

export default ordersAPI;