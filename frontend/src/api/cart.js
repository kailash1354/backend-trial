import API from './config';

// Cart API service
const cartAPI = {
  // Get cart
  getCart: async () => {
    const response = await API.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (itemData) => {
    const response = await API.post('/cart/items', itemData);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity, variant = null) => {
    const response = await API.put(`/cart/items/${productId}`, { quantity, variant });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId, variant = null) => {
    const response = await API.delete(`/cart/items/${productId}`, {
      data: { variant }
    });
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await API.delete('/cart');
    return response.data;
  },

  // Apply coupon
  applyCoupon: async (couponData) => {
    const response = await API.post('/cart/coupon', couponData);
    return response.data;
  },

  // Remove coupon
  removeCoupon: async () => {
    const response = await API.delete('/cart/coupon');
    return response.data;
  },

  // Update shipping method
  updateShippingMethod: async (method) => {
    const response = await API.put('/cart/shipping', { method });
    return response.data;
  },

  // Validate cart stock
  validateStock: async () => {
    const response = await API.get('/cart/validate');
    return response.data;
  },

  // Merge guest cart
  mergeGuestCart: async (guestCart) => {
    const response = await API.post('/cart/merge', { guestCart });
    return response.data;
  },

  // Get cart item count
  getCartCount: async () => {
    const response = await API.get('/cart/count');
    return response.data;
  },
};

export default cartAPI;