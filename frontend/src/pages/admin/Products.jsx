import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Plus, Edit, Trash2, Eye, Search, Package } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import Pagination from "../../components/UI/Pagination";
import AdvancedProductModal from "../../components/admin/AdvancedProductModal";
import { motion, AnimatePresence } from "framer-motion";

// --- API IMPORTS ---
import categoriesAPI from "../../api/categories";
import productsAPI from "../../api/products";

// --- Helper function ---
const slugify = (text) => {
  if (!text) return `product-${Date.now()}`;
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const Products = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", availability: "" });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const productsPerPage = 10;

  // --- Category Fetching ---
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "product-categories-list",
    categoriesAPI.getAll,
    { staleTime: 1000 * 60 * 60 }
  );

  const categories = categoriesData?.categories || [];

  // --- Data Fetching logic ---
  const {
    data: fetchedProductsData,
    isLoading,
    refetch,
  } = useQuery(
    [
      "adminProducts",
      { currentPage, productsPerPage, searchQuery, ...filters },
    ],
    // This is correct, using the admin-specific API
    () =>
      productsAPI.getAdminProducts({
        page: currentPage,
        limit: productsPerPage,
        search: searchQuery,
        ...filters,
      }),
    { staleTime: 0, keepPreviousData: true }
  );

  const products = fetchedProductsData?.data?.products || [];
  const totalPages = fetchedProductsData?.data?.pagination?.pages || 1;
  const totalProducts = fetchedProductsData?.data?.pagination?.total || 0;

  // --- Mutations ---
  const deleteMutation = useMutation(productsAPI.deleteProduct, {
    onSuccess: () => {
      toast.success("Product deleted!");
      queryClient.invalidateQueries("adminProducts");
      setSelectedProducts([]);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Delete failed."),
  });

  const uploadImagesMutation = useMutation(
    ({ id, formData }) => productsAPI.uploadProductImages(id, formData),
    {
      onSuccess: () => {
        // Handled in main save handler
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Image upload failed.");
      },
    }
  );

  const saveProductMutation = useMutation(
    (productData) =>
      productData._id
        ? productsAPI.updateProduct(productData._id, productData)
        : productsAPI.createProduct(productData),
    {
      onError: (error) => {
        console.error(
          "Product save failed:",
          error.response?.data || error.message
        );
        toast.error(error.response?.data?.message || "Save failed.");
      },
    }
  );

  // --- Handlers ---
  const handlePageChange = (page) => setCurrentPage(page);
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };
  const handleToggleSelect = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };
  const handleSelectAll = (event) => {
    setSelectedProducts(event.target.checked ? products.map((p) => p._id) : []);
  };
  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
      selectedProducts.forEach((id) => deleteMutation.mutate(id));
    }
  };
  const openAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };
  const openEditModal = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };
  const handleDelete = (productId) => {
    if (window.confirm("Delete this product permanently?")) {
      deleteMutation.mutate(productId);
    }
  };

  // ---
  // --- FIX 3.A: THIS IS THE CORRECTED SAVE/UPLOAD LOGIC ---
  // ---
  const handleSaveProduct = async (data) => {
    try {
      // 1. Separate image files and the "images" array from the rest of the data
      //    We do this to prevent sending blob: URLs to the update endpoint.
      const { newImageFiles, images, ...productData } = data;
      const isEditing = !!productData._id;
      const msg = isEditing ? "Product updated!" : "Product created!";

      // 2. Save the product text data (productData does NOT contain 'images')
      const response = await saveProductMutation.mutateAsync(productData);

      // 3. Get the product ID (whether it's new or existing)
      const productId = isEditing ? productData._id : response.data.product._id;

      // 4. If there are new images, upload them
      if (newImageFiles && newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach((file) => {
          formData.append("images", file);
        });

        // WAIT for the image upload to complete
        await uploadImagesMutation.mutateAsync({ id: productId, formData });

        toast.success(msg + " Images uploaded!");
      } else {
        // No new images, just a text update
        toast.success(msg);
      }

      // 5. --- THIS IS THE KEY ---
      // Only after ALL awaits are done, invalidate the query.
      // React-Query will automatically refetch.
      queryClient.invalidateQueries("adminProducts");

      // 6. Close the modal
      setIsModalOpen(false);
      setProductToEdit(null);
    } catch (error) {
      console.error(
        "An error occurred during the save process:",
        error.response?.data || error.message
      );
    }
  };
  // ---
  // --- END OF FIX 3.A ---
  // ---

  const handleToggleAvailability = (product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";

    const updatedProduct = {
      ...product,
      // Ensure category is sent as an ID if it's populated
      category: product.category?._id || product.category,
      status: newStatus,
      inventory: {
        quantity: product.inventory?.quantity || 0,
        trackQuantity: product.inventory?.trackQuantity ?? true,
      },
    };

    saveProductMutation.mutate(updatedProduct, {
      onSuccess: () => {
        toast.success(`Status set to ${newStatus}`);
        // Manually update the query data for instant UI feedback
        queryClient.setQueryData(
          [
            "adminProducts",
            { currentPage, productsPerPage, searchQuery, ...filters },
          ],
          (oldData) => {
            if (!oldData) return oldData;
            const newProducts = oldData.data.products.map((p) =>
              p._id === product._id ? { ...p, status: newStatus } : p
            );
            return {
              ...oldData,
              data: { ...oldData.data, products: newProducts },
            };
          }
        );
      },
    });
  };

  // --- ProductRow Component ---
  const ProductRow = ({ product, index }) => {
    const finalPrice = product.price;
    const productSlug = product.slug || slugify(product.name || product._id);

    const actionButtonBase =
      "p-[6px] rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface dark:focus:ring-offset-dark-surface";
    const actionButtonGold = `${actionButtonBase} bg-accent dark:bg-dark-accent text-white hover:bg-accent-2 dark:hover:opacity-90 focus:ring-accent dark:focus:ring-dark-accent`;
    const actionButtonRed = `${actionButtonBase} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;

    const isAvailable = product.status === "active";
    const availabilityButtonClass = `px-3 py-1 text-[11px] font-semibold rounded-full transition-colors shadow-sm cursor-pointer ${
      isAvailable
        ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/30 hover:bg-green-200 dark:hover:bg-green-500/30"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/30 hover:bg-yellow-200 dark:hover:bg-yellow-500/20"
    }`;

    const rowBgClass =
      index % 2 === 0
        ? "bg-surface dark:bg-dark-surface"
        : "bg-surface dark:bg-dark-highlight/30";

    const primaryImageUrl =
      product.images && product.images.length > 0 && product.images[0]?.url
        ? product.images[0].url
        : null;

    // ---
    // --- FIX 3.B: CACHE-BUSTING FOR THE ADMIN LIST ---
    // ---
    const imageUrl = primaryImageUrl
      ? `${primaryImageUrl}?v=${new Date().getTime()}`
      : "/images/placeholder.jpg";
    // --- END OF FIX 3.B ---

    return (
      <tr
        className={`${rowBgClass} border-b border-border dark:border-dark-border hover:bg-highlight/50 dark:hover:bg-dark-highlight/60 transition-colors duration-150 group`}
      >
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selectedProducts.includes(product._id)}
            onChange={() => handleToggleSelect(product._id)}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent dark:text-dark-accent focus:ring-accent dark:focus:ring-dark-accent bg-surface dark:bg-dark-surface cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </td>
        <td className="px-4 py-3">
          <img
            src={imageUrl} // Use the cache-busted URL
            alt={product.name || "Product Image"}
            className="w-10 h-10 object-cover rounded-md shadow-subtle border border-border dark:border-dark-border"
            // This onError handler ensures the local placeholder path is used if the Cloudinary URL fails.
            onError={(e) => {
              if (e.currentTarget.src !== "/images/placeholder.jpg") {
                e.currentTarget.src = "/images/placeholder.jpg";
              }
              e.currentTarget.onerror = null;
            }}
          />
        </td>
        <td
          className="px-4 py-3 font-medium text-sm text-primary dark:text-dark-primary max-w-xs truncate"
          title={product.name}
        >
          {product.name}
          <span
            className={`ml-2 px-2 py-0.5 text-[10px] rounded font-medium ${
              product.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/30"
                : product.status === "draft"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/30"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400 ring-1 ring-inset ring-gray-600/10 dark:ring-gray-700/30"
            }`}
          >
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted dark:text-dark-muted hidden md:table-cell">
          {product.category?.name || "N/A"}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className="font-semibold text-primary dark:text-dark-primary">
            ₹{parseFloat(finalPrice).toLocaleString("en-IN")}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted dark:text-dark-muted hidden sm:table-cell">
          {product.inventory?.quantity || 0}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAvailability(product);
            }}
            className={availabilityButtonClass}
            title={`Toggle status (Currently: ${product.status})`}
            disabled={saveProductMutation.isLoading}
          >
            {isAvailable ? "Active" : "Inactive"}
          </button>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center space-x-1.5 justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(product);
              }}
              className={actionButtonGold}
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </button>
            <a
              href={`/product/${productSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={actionButtonGold}
              title="View Product on Storefront"
            >
              <Eye className="w-4 h-4" />
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(product._id);
              }}
              className={actionButtonRed}
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // --- Main Render ---
  if (
    (isLoading || categoriesLoading) &&
    currentPage === 1 &&
    !searchQuery &&
    !filters.status &&
    !filters.availability
  ) {
    return (
      <div className="p-6 min-h-[calc(100vh-100px)] flex items-center justify-center bg-bg dark:bg-dark-bg">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Products - Luxe Heritage</title>
      </Helmet>
      <div className="p-4 md:p-6 lg:p-8 bg-bg dark:bg-dark-bg min-h-screen">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl lg:text-4xl font-display font-bold text-primary dark:text-dark-primary mb-6 lg:mb-8"
        >
          Product Management
        </motion.h1>
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-5 md:p-6 lg:p-8"
        >
          {/* Toolbar */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left: Search & Bulk */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64 lg:w-80">
                <Search className="p-3 absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted dark:text-dark-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="placeholder:pl-5.5 input pl-11 pr-4 py-2 w-full text-sm !rounded-lg"
                />
              </div>
              {selectedProducts.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleBulkDelete}
                  className="btn-outline border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 text-xs flex items-center whitespace-nowrap rounded-md"
                  disabled={deleteMutation.isLoading}
                  title={`Delete ${selectedProducts.length} selected items`}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete (
                  {selectedProducts.length})
                </motion.button>
              )}
            </div>
            {/* Right: Filters & Add */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end flex-wrap">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="form-input text-sm py-2 pl-3 pr-8 min-w-[130px] rounded-md appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filters.availability}
                onChange={(e) =>
                  handleFilterChange("availability", e.target.value)
                }
                className="form-input text-sm py-2 pl-3 pr-8 min-w-[150px] rounded-md appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                <option value="">All Availability</option>
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
              <button
                onClick={openAddModal}
                className="btn btn-primary px-4 py-2 text-sm flex items-center whitespace-nowrap shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Product
              </button>
            </div>
          </div>
          {/* Table Area */}
          {isLoading && products.length === 0 && currentPage > 1 ? (
            <div className="text-center py-10 text-muted dark:text-dark-muted">
              Loading more products...
            </div>
          ) : !isLoading && products.length === 0 ? (
            <div className="text-center py-16 border-t border-border dark:border-dark-border mt-6">
              <Package className="w-16 h-16 mx-auto text-muted dark:text-dark-muted opacity-30 mb-4" />
              <h3 className="text-xl font-semibold text-primary dark:text-dark-primary mb-1">
                No Products Found
              </h3>
              <p className="text-muted dark:text-dark-muted text-sm max-w-sm mx-auto">
                {searchQuery || filters.status || filters.availability
                  ? "Try adjusting your search or filters."
                  : "Your product catalog is empty. Add your first product to get started."}
              </p>
              {!searchQuery && !filters.status && !filters.availability && (
                <button
                  onClick={openAddModal}
                  className="mt-5 btn btn-primary px-5 py-2"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add First Product
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border dark:border-dark-border shadow-subtle relative">
              {(isLoading ||
                saveProductMutation.isLoading ||
                uploadImagesMutation.isLoading) && (
                <div className="absolute inset-0 bg-surface/60 dark:bg-dark-surface/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                  <LoadingSpinner />
                </div>
              )}
              <table className="min-w-full divide-y divide-border dark:divide-dark-border">
                <thead className="bg-highlight/50 dark:bg-dark-highlight/30">
                  <tr>
                    <th className="px-4 py-3 w-12 text-left">
                      <input
                        type="checkbox"
                        checked={
                          products.length > 0 &&
                          selectedProducts.length === products.length
                        }
                        ref={(el) =>
                          el &&
                          (el.indeterminate =
                            selectedProducts.length > 0 &&
                            selectedProducts.length < products.length)
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent dark:text-dark-accent focus:ring-accent dark:focus:ring-dark-accent bg-surface dark:bg-dark-surface cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider hidden md:table-cell">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider hidden sm:table-cell">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-dark-border">
                  {products.map((product, index) => (
                    <ProductRow
                      key={product._id}
                      product={product}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {products.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted dark:text-dark-muted">
                Showing{" "}
                <span className="font-medium text-primary dark:text-dark-primary">
                  {products.length > 0
                    ? (currentPage - 1) * productsPerPage + 1
                    : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium text-primary dark:text-dark-primary">
                  {Math.min(currentPage * productsPerPage, totalProducts)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-primary dark:text-dark-primary">
                  {totalProducts}
                </span>{" "}
                results
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </motion.div>
      </div>
      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AdvancedProductModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setProductToEdit(null);
            }}
            productToEdit={productToEdit}
            onSubmit={handleSaveProduct}
            isSaving={
              saveProductMutation.isLoading || uploadImagesMutation.isLoading
            }
            categories={categories}
            categoriesLoading={categoriesLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Products;
