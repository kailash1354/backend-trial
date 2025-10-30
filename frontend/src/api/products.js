import API from "./config";

// Products API service
const productsAPI = {
  // Get all products (Public)
  getProducts: async (params = {}) => {
    const response = await API.get("/products", { params });
    return response.data;
  },

  // --- (NEW FUNCTION TO ADD) ---
  // Get all products (Admin) - calls the new admin-only route
  getAdminProducts: async (params = {}) => {
    const response = await API.get("/admin/products", { params });
    return response.data;
  },
  // --- (END OF NEW FUNCTION) ---

  // Get single product
  getProduct: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },

  // Get product by slug
  getProductBySlug: async (slug) => {
    const response = await API.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (id) => {
    const response = await API.get(`/products/${id}/related`);
    return response.data;
  },

  // Get product filters
  getFilters: async () => {
    const response = await API.get("/products/filters/all");
    return response.data;
  },

  // Create product (Admin)
  createProduct: async (productData) => {
    const response = await API.post("/products", productData);
    return response.data;
  },

  // Update product (Admin)
  updateProduct: async (id, productData) => {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  },

  // Upload product images (Admin)
  uploadProductImages: async (id, formData) => {
    const response = await API.post(`/products/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete product image (Admin)
  deleteProductImage: async (productId, publicId) => {
    const response = await API.delete(
      `/products/${productId}/images/${publicId}`
    );
    return response.data;
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    const response = await API.post(
      `/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  },

  // Update product review
  updateReview: async (productId, reviewId, reviewData) => {
    const response = await API.put(
      `/products/${productId}/reviews/${reviewId}`,
      reviewData
    );
    return response.data;
  },

  // Delete product review
  deleteReview: async (productId, reviewId) => {
    const response = await API.delete(
      `/products/${productId}/reviews/${reviewId}`
    );
    return response.data;
  },
};

// --- (MAKE SURE TO EXPORT THE NEW FUNCTION) ---
export default {
  getProducts: productsAPI.getProducts,
  getAdminProducts: productsAPI.getAdminProducts, // <-- ADD THIS LINE
  getProduct: productsAPI.getProduct,
  getProductBySlug: productsAPI.getProductBySlug,
  getRelatedProducts: productsAPI.getRelatedProducts,
  getFilters: productsAPI.getFilters,
  createProduct: productsAPI.createProduct,
  updateProduct: productsAPI.updateProduct,
  deleteProduct: productsAPI.deleteProduct,
  uploadProductImages: productsAPI.uploadProductImages,
  deleteProductImage: productsAPI.deleteProductImage,
  addReview: productsAPI.addReview,
  updateReview: productsAPI.updateReview,
  deleteReview: productsAPI.deleteReview,
};
