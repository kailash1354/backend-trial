import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import productsAPI from "../api/products";
import ProductCard from "../components/Products/ProductCard";
import ProductFilters from "../components/Products/ProductFilters";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Pagination from "../components/UI/Pagination";
import { motion } from "framer-motion";
import { Grid, List } from "lucide-react"; // Import icons for view toggle

const Shop = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    limit: 12,
    sort: searchParams.get("sort") || "-createdAt",
    category: category || searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: parseFloat(searchParams.get("minPrice")) || 0,
    maxPrice: parseFloat(searchParams.get("maxPrice")) || 999999,
    search: searchParams.get("search") || "",
    inStock: searchParams.get("inStock") === "true",
  });

  const [viewMode, setViewMode] = useState("grid");

  const {
    data: productsData,
    isLoading,
    isError,
    isPreviousData,
  } = useQuery(["products", filters], () => productsAPI.getProducts(filters), {
    keepPreviousData: true,
  });

  const { data: filtersData } = useQuery("product-filters", () =>
    productsAPI.getFilters()
  );

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || {};
  const totalPages = pagination.pages || 1;
  const totalProducts = pagination.total || 0;

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (filters.page > 1) newParams.set("page", filters.page.toString());
    if (filters.sort !== "-createdAt") newParams.set("sort", filters.sort);
    if (filters.category) newParams.set("category", filters.category);
    // Add other filters similarly...
    setSearchParams(newParams, { replace: true }); // Use replace to avoid history bloat
  }, [filters, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (sort) => {
    setFilters((prev) => ({ ...prev, sort, page: 1 }));
  };

  const pageTitle = category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
    : "All Products";
  const pageDescription = "Explore our curated selection of luxury fashion.";

  return (
    // Body background is handled by theme.css
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 border-b border-[rgb(var(--border))] pb-8" // Added border bottom
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            {pageTitle}
          </h1>
          <p className="text-lg text-muted max-w-3xl leading-relaxed">
            {pageDescription}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {" "}
          {/* Increased gap */}
          {/* Sidebar Filters */}
          <motion.div // Animate sidebar
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:w-1/4 xl:w-1/5" // Adjusted width
          >
            {/* Wrap filters in a styled container if needed, ProductFilters might already have one */}
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              availableFilters={filtersData?.data || {}}
            />
          </motion.div>
          {/* Main Content */}
          <div className="lg:w-3/4 xl:w-4/5">
            {" "}
            {/* Adjusted width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0"
            >
              <div className="text-base text-muted">
                {" "}
                {/* Adjusted text size/color */}
                Showing {products.length} of {totalProducts} products
              </div>

              <div className="flex items-center space-x-4">
                {" "}
                {/* Reduced space */}
                <select
                  value={filters.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  // Use input-luxury styling but adjust padding/appearance
                  className="input-luxury !py-2 !px-4 !pr-10 appearance-select" // Added appearance-select
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='rgba(var(--muted), 0.9)' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }} // Custom arrow
                >
                  <option value="-createdAt">Newest</option>
                  <option value="createdAt">Oldest</option>
                  <option value="-price">Price: High-Low</option>
                  <option value="price">Price: Low-High</option>
                  <option value="-ratings.average">Top Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
                <div className="flex items-center space-x-1 bg-surface rounded-md p-1 border border-[rgb(var(--border))]">
                  {" "}
                  {/* Bordered container */}
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors duration-200 ${
                      viewMode === "grid"
                        ? "bg-highlight text-accent"
                        : "text-muted hover:text-primary"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors duration-200 ${
                      viewMode === "list"
                        ? "bg-highlight text-accent"
                        : "text-muted hover:text-primary"
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
            {/* Loading/Error/No Products States */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner size="large" />
              </div>
            ) : isError ? (
              <div className="text-center py-20 text-red-600">
                <p>Error loading products. Please try again.</p>
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-20"
              >
                <h3 className="text-3xl font-semibold text-primary mb-4">
                  No products found
                </h3>
                <p className="text-lg text-muted max-w-md mx-auto">
                  Try adjusting your filters or search terms.
                </p>
              </motion.div>
            ) : (
              // Products Grid/List
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={
                  viewMode === "grid"
                    ? "product-grid-luxury" // Use class from App.css
                    : "space-y-6" // Adjusted list spacing
                }
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.5 }} // Faster stagger
                    style={{ opacity: isPreviousData ? 0.6 : 1 }} // Dim products while loading next page
                  >
                    {/* Render ProductCard normally, list view needs specific styling */}
                    <ProductCard product={product} />
                    {/* Add list view specific layout here if needed */}
                  </motion.div>
                ))}
              </motion.div>
            )}
            {/* Pagination */}
            {!isLoading && !isError && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-16 pt-8 border-t border-[rgb(var(--border))]" // Added top border
              >
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
