import API from "./config";

// Categories API service
const categoriesAPI = {
  // Get all categories (used by both Admin and Shop pages)
  getAll: async () => {
    const response = await API.get("/admin/categories");
    return response.data;
  },

  // Create new category (Admin)
  create: async (categoryData) => {
    const response = await API.post("/admin/categories", categoryData);
    return response.data;
  },

  // Update category (Admin)
  update: async (id, categoryData) => {
    const response = await API.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (Admin)
  remove: async (id) => {
    const response = await API.delete(`/admin/categories/${id}`);
    return response.data;
  },
};

export default categoriesAPI;
