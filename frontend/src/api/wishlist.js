import API from './config';

// Wishlist API service
const wishlistAPI = {
  // Get wishlist
  getWishlist: async () => {
    const response = await API.get('/wishlist');
    return response.data;
  },

  // Add item to wishlist
  addToWishlist: async (itemData) => {
    const response = await API.post('/wishlist/items', itemData);
    return response.data;
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId) => {
    const response = await API.delete(`/wishlist/items/${productId}`);
    return response.data;
  },

  // Clear wishlist
  clearWishlist: async () => {
    const response = await API.delete('/wishlist');
    return response.data;
  },

  // Update wishlist item
  updateWishlistItem: async (productId, itemData) => {
    const response = await API.put(`/wishlist/items/${productId}`, itemData);
    return response.data;
  },

  // Check if item is in wishlist
  checkInWishlist: async (productId) => {
    const response = await API.get(`/wishlist/check/${productId}`);
    return response.data;
  },

  // Move item to cart
  moveToCart: async (productId, quantity = 1, variant = null) => {
    const response = await API.post(`/wishlist/move-to-cart/${productId}`, {
      quantity,
      variant
    });
    return response.data;
  },

  // Get shared wishlist
  getSharedWishlist: async (token) => {
    const response = await API.get(`/wishlist/shared/${token}`);
    return response.data;
  },

  // Generate share token
  generateShareToken: async () => {
    const response = await API.post('/wishlist/share');
    return response.data;
  },

  // Revoke share token
  revokeShareToken: async () => {
    const response = await API.delete('/wishlist/share');
    return response.data;
  },

  // Update wishlist settings
  updateSettings: async (settings) => {
    const response = await API.put('/wishlist/settings', settings);
    return response.data;
  },

  // Get items by priority
  getItemsByPriority: async (priority) => {
    const response = await API.get(`/wishlist/priority/${priority}`);
    return response.data;
  },
};

export default wishlistAPI;