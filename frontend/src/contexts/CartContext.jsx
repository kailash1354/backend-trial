// src/contexts/CartContext.jsx

import { createContext, useContext, useState, useEffect, useRef } from "react";
import cartAPI from "../api/cart";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext"; // 1. IMPORT YOUR AUTH HOOK

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

const CART_KEY = "luxe:cart_data";
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const cached = sessionStorage.getItem(CART_KEY);
    return cached ? JSON.parse(cached) : null;
  });

  // 2. GET THE USER
  const { user } = useAuth();

  // 3. UPDATE LOADING LOGIC
  // We are loading if we don't have a user AND we don't have a cached cart.
  const [loading, setLoading] = useState(!user && !cart);

  useEffect(() => {
    // 4. IF NO USER, DO NOTHING.
    // If we have a cached cart (guest cart), just use that.
    // Otherwise, clear the cart and set loading to false.
    if (!user) {
      if (!cart) {
        setLoading(false);
      }
      // Note: You might want to clear the 'cart' state here
      // if a user logs out, e.g., setCart(null);
      return;
    }

    // If we have a user but also a cached cart, we might
    // need to merge them. For now, we'll just fetch the user's cart.
    // The 'sessionStorage' logic is good for caching, but we'll still fetch
    // on user change to ensure data is fresh.

    setLoading(true); // We have a user, set loading
    const controller = new AbortController();

    const loadCart = async (signal) => {
      try {
        const res = await cartAPI.getCart(signal);
        const data = res.data.cart;
        setCart(data);
        sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      } catch (e) {
        if (cartAPI.isCancel?.(e) || e.name === "CanceledError") {
          return;
        }
        console.error("Failed to load cart:", e);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadCart(controller.signal);

    return () => {
      controller.abort();
    };
  }, [user]); // 5. ADD 'user' TO THE DEPENDENCY ARRAY (replace 'cart')

  /* ---- all your other functions remain untouched ---- */
  // ... (addToCart, updateQuantity, etc. are all the same)

  const addToCart = async (pId, qty = 1, variant = null) => {
    try {
      const res = await cartAPI.addToCart({
        productId: pId,
        quantity: qty,
        variant,
      });
      const data = res.data.cart;
      setCart(data);
      sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      toast.success("Item added to cart");
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Add failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const updateQuantity = async (pId, qty, variant = null) => {
    try {
      const res = await cartAPI.updateCartItem(pId, qty, variant);
      const data = res.data.cart;
      setCart(data);
      sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      qty === 0 ? toast.success("Removed") : toast.success("Updated");
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Update failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const removeFromCart = async (pId, variant = null) => {
    try {
      const res = await cartAPI.removeFromCart(pId, variant);
      const data = res.data.cart;
      setCart(data);
      sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      toast.success("Item removed");
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Remove failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartAPI.clearCart();
      const data = res.data.cart;
      setCart(data);
      sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      toast.success("Cart cleared");
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Clear failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const applyCoupon = async (code, discount, type = "percentage") => {
    try {
      const res = await cartAPI.applyCoupon({ code, discount, type });
      const data = res.data.cart;
      setCart(data);
      sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      toast.success("Coupon applied");
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Coupon failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await cartAPI.removeCoupon();
      const data = res.data.cart;
      setCart(data);
      sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      toast.success("Coupon removed");
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Remove coupon failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const updateShippingMethod = async (method) => {
    try {
      const res = await cartAPI.updateShippingMethod(method);
      const data = res.data.cart;
      setCart(data);
      sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      toast.success("Shipping updated");
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Shipping update failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const validateStock = async () => {
    try {
      const res = await cartAPI.validateStock();
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || "Stock validation failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const mergeGuestCart = async (guestCart) => {
    try {
      const res = await cartAPI.mergeGuestCart(guestCart);
      const data = res.data.cart;
      setCart(data);
      sessionStorage.setItem(CART_KEY, JSON.stringify(data));
      toast.success("Guest cart merged");
      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || "Merge failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const getCartTotal = () =>
    cart?.items?.reduce(
      (t, i) =>
        t +
        ((i.product?.price || 0) + (i.variant?.priceAdjustment || 0)) *
          i.quantity,
      0
    ) ?? 0;

  const isInCart = (pId, variant = null) =>
    cart?.items?.some(
      (i) =>
        i.product?._id === pId &&
        (variant ? JSON.stringify(i.variant) === JSON.stringify(variant) : true)
    ) ?? false;

  const getItemQuantity = (pId, variant = null) =>
    cart?.items?.find(
      (i) =>
        i.product?._id === pId &&
        (variant ? JSON.stringify(i.variant) === JSON.stringify(variant) : true)
    )?.quantity ?? 0;

  const value = {
    cart,
    loading,
    cartCount: cart?.items?.reduce((t, i) => t + i.quantity, 0) ?? 0,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    updateShippingMethod,
    validateStock,
    mergeGuestCart,
    getCartTotal,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
