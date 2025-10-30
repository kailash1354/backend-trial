import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "react-query";
import productsAPI from "../api/products";
import { ChevronRight, Star, ShoppingBag, Heart, Eye } from "lucide-react";
import HeroSection from "../components/Home/HeroSection";
import ProductCard from "../components/Products/ProductCard";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const Home = () => {
  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery(
    "featured-products",
    () => productsAPI.getProducts({ featured: true, limit: 8 }),
    { staleTime: 1000 * 60 * 5 } // Cache for 5 mins
  );

  // Fetch new arrivals
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useQuery(
    "new-arrivals",
    () => productsAPI.getProducts({ sort: "-createdAt", limit: 8 }),
    { staleTime: 1000 * 60 * 5 } // Cache for 5 mins
  );

  const featuredProducts = featuredData?.data?.products || [];
  const newArrivals = newArrivalsData?.data?.products || [];

  const categories = [
    {
      name: "Women",
      image: "/images/women-fashion.jpg",
      path: "/shop/women",
      count: 124,
    },
    {
      name: "Men",
      image: "/images/men-fashion.jpg",
      path: "/shop/men",
      count: 98,
    },
    {
      name: "Accessories",
      image: "/images/accessories.jpg",
      path: "/shop/accessories",
      count: 76,
    },
    {
      name: "Shoes",
      image: "/images/shoes.jpg",
      path: "/shop/shoes",
      count: 54,
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Premium Products" },
    { number: "50+", label: "Luxury Brands" },
    { number: "24/7", label: "Customer Support" },
  ];

  // Combine loading states for clarity
  const isLoading = featuredLoading || newArrivalsLoading;

  return (
    // Body background set by theme.css
    <div className="min-h-screen">
      <HeroSection />

      {/* Featured Categories - Removed explicit bg-white/dark:bg-gray-900 */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div // Added motion for entrance animation
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {" "}
              {/* Use text-primary */}
              Shop by Category
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {" "}
              {/* Use text-muted */}
              Discover our curated collections of luxury fashion and premium
              lifestyle products.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }} // Animate when in view
                viewport={{ once: true, amount: 0.2 }} // Trigger animation once
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3]" // Use aspect ratio
              >
                {/* Image Container */}
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent group-hover:from-black/70 transition-opacity duration-300" />
                </div>
                {/* Content positioned at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
                  <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-200 mb-3">
                    {category.count} Products
                  </p>
                  <Link
                    to={category.path}
                    // Adjusted button style for visibility on image
                    className="inline-flex items-center px-4 py-2 bg-white/90 text-black text-sm font-semibold rounded-md hover:bg-white transition-colors group/btn"
                  >
                    Shop Now
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Removed bg-gray-50/dark:bg-gray-800, added bg-highlight */}
      <section className="py-16 md:py-24 bg-highlight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {" "}
              {/* Use text-primary */}
              Featured Products
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {" "}
              {/* Use text-muted */}
              Handpicked selection of our most popular and exclusive items.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals - Removed explicit bg-white/dark:bg-gray-900 */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {" "}
              {/* Use text-primary */}
              New Arrivals
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {" "}
              {/* Use text-muted */}
              Be the first to discover our latest additions.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {newArrivals.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }} // Stagger slightly differently
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section - Changed to bg-surface */}
      <section className="py-16 bg-surface text-primary">
        {" "}
        {/* Use bg-surface */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-2">
                  {" "}
                  {/* Font uses heading style */}
                  {stat.number}
                </h3>
                <p className="text-muted">{stat.label}</p>{" "}
                {/* Use text-muted */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Use bg-highlight */}
      <section className="py-16 md:py-24 bg-highlight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto text-center" /* Slightly narrower */
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Stay in Style
            </h2>
            <p className="text-muted mb-8 text-lg">
              Subscribe for exclusive offers and updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="input-luxury w-full !rounded-md" // Updated radius
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                className="btn-luxury btn-luxury-primary !rounded-md" // Updated radius
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
