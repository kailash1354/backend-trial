import { useState } from "react";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence

const ProductFilters = ({ filters, onFilterChange, availableFilters }) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    availability: true,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (type, value) => {
    onFilterChange({
      ...filters,
      [type]: parseFloat(value) || (type === "maxPrice" ? 999999 : 0),
    });
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      category: "",
      brand: "",
      minPrice: 0,
      maxPrice: 999999,
      inStock: false,
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.brand ||
    filters.minPrice > 0 ||
    filters.maxPrice < 999999 ||
    filters.inStock;

  const FilterSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-[rgb(var(--border))] pb-4 mb-4">
      <button
        onClick={onToggle}
        // Removed text color classes, inherit from theme.css
        className="flex items-center justify-between w-full text-left font-medium text-primary hover:text-accent-2 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const FilterContent = () => (
    <>
      {hasActiveFilters && (
        <div className="mb-6">
          <button
            onClick={clearFilters}
            // Use text-muted and appropriate hover from theme.css (via <a> styling)
            className="flex items-center space-x-2 text-sm text-muted hover:text-accent-2"
          >
            <X className="w-4 h-4" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}

      {availableFilters.categories &&
        availableFilters.categories.length > 0 && (
          <FilterSection
            title="Categories"
            isOpen={openSections.category}
            onToggle={() => toggleSection("category")}
          >
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {" "}
              {/* Added padding for scrollbar */}
              {availableFilters.categories.map((category) => (
                <label
                  key={category._id}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.slug}
                    checked={filters.category === category.slug}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    // Style radio button to use accent color
                    className="w-4 h-4 text-accent bg-surface border-[rgb(var(--border))] focus:ring-accent focus:ring-2"
                  />
                  {/* Removed text color classes, inherit */}
                  <span className="text-sm text-primary group-hover:text-accent-2 transition-colors">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted">
                    ({category.count || 0})
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

      {availableFilters.brands && availableFilters.brands.length > 0 && (
        <FilterSection
          title="Brands"
          isOpen={openSections.brand}
          onToggle={() => toggleSection("brand")}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {availableFilters.brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={brand}
                  checked={filters.brand === brand} // Assuming single brand selection for now
                  onChange={(e) =>
                    handleFilterChange("brand", e.target.checked ? brand : "")
                  }
                  // Style checkbox to use accent color
                  className="w-4 h-4 text-accent bg-surface border-[rgb(var(--border))] rounded focus:ring-accent focus:ring-offset-0 focus:ring-2"
                />
                <span className="text-sm text-primary group-hover:text-accent-2 transition-colors">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection
        title="Price Range"
        isOpen={openSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-4">
          <div>
            {/* Removed text color classes */}
            <label className="block text-sm text-primary mb-1">
              Min Price: ${filters.minPrice}
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              className="w-full h-2 bg-[rgb(var(--border))] rounded-lg appearance-none cursor-pointer accent-accent" // Style range input
            />
          </div>
          <div>
            <label className="block text-sm text-primary mb-1">
              Max Price: $
              {filters.maxPrice >= 999999 ? "Any" : `$${filters.maxPrice}`}
            </label>{" "}
            {/* Display 'Any' */}
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={filters.maxPrice >= 999999 ? 1000 : filters.maxPrice} // Cap value for range
              onChange={(e) =>
                handlePriceChange(
                  "maxPrice",
                  e.target.value === "1000" ? 999999 : e.target.value
                )
              } // Set back to high number if max selected
              className="w-full h-2 bg-[rgb(var(--border))] rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection
        title="Availability"
        isOpen={openSections.availability}
        onToggle={() => toggleSection("availability")}
      >
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange("inStock", e.target.checked)}
              className="w-4 h-4 text-accent bg-surface border-[rgb(var(--border))] rounded focus:ring-accent focus:ring-offset-0 focus:ring-2"
            />
            <span className="text-sm text-primary group-hover:text-accent-2 transition-colors">
              In Stock Only
            </span>
          </label>
        </div>
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          // Use theme colors
          className="flex items-center space-x-2 px-4 py-2 bg-surface border border-[rgb(var(--border))] rounded-md text-primary hover:bg-highlight"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-accent text-btn-text text-xs rounded-full px-2 py-0.5 ml-1">
              {" "}
              {/* Adjusted padding */}
              Active
            </span>
          )}
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        {/* Use card-luxury styling */}
        <div className="card-luxury p-6">
          <div className="flex items-center justify-between mb-6 border-b border-[rgb(var(--border))] pb-3">
            <h3 className="text-xl font-semibold text-primary">
              {" "}
              {/* Use text-primary */}
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted hover:text-accent-2" // Use theme colors
              >
                Clear All
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden" // Ensure high z-index
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" // Darker overlay with blur
              onClick={() => setMobileFiltersOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              // Use bg-surface, ensure text color is correct
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
                <h3 className="text-lg font-semibold text-primary">
                  {" "}
                  {/* Use text-primary */}
                  Filters
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 text-muted hover:text-primary" // Use theme colors
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-grow pb-20">
                {" "}
                {/* Ensure scrolling */}
                <FilterContent />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductFilters;
