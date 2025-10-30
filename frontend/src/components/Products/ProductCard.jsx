import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useAuth } from "../../contexts/AuthContext";
import { ShoppingBag, Heart, Eye, Star } from "lucide-react";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const isProductInCart = isInCart(product._id);
  const isProductInWishlist = isInWishlist(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    const result = await addToCart(product._id, 1);
    if (result.success) {
      toast.success("Added to cart");
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (isProductInWishlist) {
      toast.info("Item already in wishlist");
      return;
    }

    const result = await addToWishlist(product._id);
    if (result.success) {
      toast.success("Added to wishlist");
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement quick view modal
    toast.success("Quick view coming soon");
  };

  const discountPercentage = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0;

  const averageRating = product.ratings?.average || 0;
  const reviewCount = product.ratings?.count || 0;

  // ---
  // --- FIX 4: CACHE-BUSTING FOR THE SHOP PAGE ---
  // ---
  const imageUrl = product.images?.[0]?.url
    ? `${product.images[0].url}?v=${new Date().getTime()}`
    : "/images/placeholder.jpg";
  // --- END OF FIX 4 ---

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-w-3 aspect-h-4 overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={imageUrl} // Use the cache-busted URL
            alt={product.name}
            className={`w-full h-64 object-cover transition-transform duration-300 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder.jpg";
            }}
          />

          {/* Hover overlay */}
          <div
            className={`absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.featured && (
            <span className="bg-black text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className={`absolute top-2 right-2 flex flex-col space-y-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          }`}
        >
          <button
            onClick={handleAddToWishlist}
            className={`p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
              isProductInWishlist
                ? "text-red-500"
                : "text-gray-600 dark:text-gray-400"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-4 h-4 ${isProductInWishlist ? "fill-current" : ""}`}
            />
          </button>

          <button
            onClick={handleQuickView}
            className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <div
          className={`absolute bottom-2 left-2 right-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <button
            onClick={handleAddToCart}
            disabled={isProductInCart}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 ${
              isProductInCart
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isProductInCart ? "In Cart" : "Add to Cart"}</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= averageRating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.category?.name || "Uncategorized"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
