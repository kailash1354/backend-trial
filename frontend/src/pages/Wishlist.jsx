// src/pages/Wishlist.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
// Import the hook - you'll uncomment and use these later
// import { useWishlist } from "../contexts/WishlistContext";
// import LoadingSpinner from "../components/UI/LoadingSpinner";
// import ProductCard from "../components/Products/ProductCard"; // Or a WishlistItem component

const Wishlist = () => {
  // Placeholder data - Replace with hook data later
  // const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const wishlist = null; // Placeholder: Simulate empty wishlist initially
  const loading = false; // Placeholder
  const wishlistItems = wishlist?.items || []; // Placeholder

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <LoadingSpinner size="large" />
  //     </div>
  //   );
  // }

  return (
    <>
      <Helmet>
        <title>My Wishlist - Luxe Heritage</title>
        <meta name="description" content="View and manage your saved items." />
      </Helmet>

      <div className="min-h-screen py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {" "}
          {/* Wider container for wishlist */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 md:mb-12 border-b border-[rgb(var(--border))] pb-6 flex justify-between items-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center">
              <Heart className="w-8 h-8 mr-3 text-accent" />
              My Wishlist
            </h1>
            {/* Add Clear Wishlist button when items exist (implement later) */}
            {/* {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist} // Add clearWishlist function from hook
                className="text-sm text-muted hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            )} */}
          </motion.div>
          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="card-luxury p-8 md:p-12 text-center" // Use luxury card
            >
              <Heart className="w-16 h-16 mx-auto text-muted mb-6" />
              <h2 className="text-2xl font-semibold text-primary mb-3">
                Your Wishlist is Empty
              </h2>
              <p className="text-muted mb-6">
                Save your favorite items here to view them later.
              </p>
              <Link
                to="/shop"
                className="btn-luxury btn-luxury-primary inline-flex items-center" // Use luxury button
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Discover Products
              </Link>
            </motion.div>
          ) : (
            <motion.div // Use motion for the list container
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              // Grid layout for wishlist items
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {/* Placeholder: Map through actual wishlist items here */}
              {/* Replace this paragraph with item mapping */}
              <p className="text-muted col-span-full text-center py-10">
                Wishlist items will appear here.
              </p>

              {/* Example Item Structure (using ProductCard or a dedicated WishlistItem): */}
              {/* {wishlistItems.map((item, index) => (
                <motion.div
                  key={item._id || index} // Use a unique key
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="relative" // Add relative positioning for remove button
                >
                   // Assuming item.product exists and ProductCard is suitable
                  {item.product && <ProductCard product={item.product} />}

                  // Example Remove Button (Position appropriately)
                  <button
                    onClick={() => removeFromWishlist(item.product?._id)} // Use product ID
                    className="absolute top-2 right-2 p-1.5 bg-red-100/80 text-red-600 rounded-full hover:bg-red-200/90 transition-colors z-10" // Example styling
                    aria-label="Remove from wishlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))} */}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
