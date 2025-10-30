// src/pages/Cart.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft } from "lucide-react"; // Import icons

const Cart = () => {
  // Replace with actual cart logic later using useCart() hook
  const cartItems = []; // Placeholder for cart items
  const cartTotal = 0; // Placeholder for cart total

  return (
    <>
      <Helmet>
        <title>Shopping Cart - Luxe Heritage</title>
        <meta
          name="description"
          content="Review your items and proceed to checkout."
        />
      </Helmet>

      <div className="min-h-screen py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div // Added motion
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 flex items-center">
              <ShoppingBag className="w-8 h-8 mr-3 text-accent" />
              Shopping Cart
            </h1>
          </motion.div>

          {cartItems.length === 0 ? (
            <motion.div // Added motion
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="card-luxury p-8 md:p-10 text-center"
            >
              <ShoppingBag className="w-16 h-16 mx-auto text-muted mb-6" />
              <h2 className="text-2xl font-semibold text-primary mb-3">
                Your Cart is Empty
              </h2>
              <p className="text-muted mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link
                to="/shop"
                className="btn-luxury btn-luxury-primary inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <motion.div // Added motion
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="card-luxury p-6 md:p-8" // Use luxury card
            >
              {/* Placeholder for cart items list */}
              <div className="divide-y divide-[rgb(var(--border))]">
                {/* Map through cartItems here */}
                <p className="py-4 text-muted">
                  Cart items will be listed here.
                </p>
              </div>

              {/* Cart Summary */}
              <div className="mt-8 pt-6 border-t border-[rgb(var(--border))]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-primary">
                    Subtotal:
                  </span>
                  <span className="text-xl font-semibold text-primary">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted mb-6 text-right">
                  Shipping & taxes calculated at checkout.
                </p>
                <Link
                  to="/checkout"
                  className="w-full btn-luxury btn-luxury-primary text-center block"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
