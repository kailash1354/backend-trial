import { body } from "express-validator";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Helper function to populate cart
const populateCart = (cartId) => {
  return Cart.findById(cartId).populate({
    path: "items.product",
    select:
      "name price images inventory.trackQuantity inventory.quantity inventory.allowBackorders",
    populate: {
      path: "category",
      select: "name",
    },
  });
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id });
  }

  const populatedCart = await populateCart(cart._id);

  res.status(200).json({
    success: true,
    data: { cart: populatedCart },
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, variant } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Check if product is active
  if (product.status !== "active") {
    return res.status(400).json({
      success: false,
      message: "Product is not available",
    });
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id });
  }

  // Add item to cart
  await cart.addItem(productId, quantity, variant);

  const populatedCart = await populateCart(cart._id);

  res.status(201).json({
    success: true,
    message: "Item added to cart successfully",
    data: { cart: populatedCart },
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, variant } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  await cart.updateQuantity(productId, quantity, variant);

  const populatedCart = await populateCart(cart._id);

  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: { cart: populatedCart },
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variant } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  await cart.removeItem(productId, variant);

  const populatedCart = await populateCart(cart._id);

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: { cart: populatedCart },
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  await cart.clear();

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: { cart },
  });
});

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, discount, type } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  // In a real application, you would validate the coupon code against a Coupon model
  // For now, we'll just apply it directly
  await cart.applyCoupon(code, discount, type);

  const populatedCart = await populateCart(cart._id);

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    data: { cart: populatedCart },
  });
});

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  await cart.removeCoupon();

  const populatedCart = await populateCart(cart._id);

  res.status(200).json({
    success: true,
    message: "Coupon removed successfully",
    data: { cart: populatedCart },
  });
});

// @desc    Update shipping method
// @route   PUT /api/cart/shipping
// @access  Private
export const updateShippingMethod = asyncHandler(async (req, res) => {
  const { method } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.shippingMethod = method;
  await cart.save();

  const populatedCart = await populateCart(cart._id);

  res.status(200).json({
    success: true,
    message: "Shipping method updated successfully",
    data: { cart: populatedCart },
  });
});

// @desc    Validate cart stock
// @route   GET /api/cart/validate
// @access  Private
export const validateStock = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const stockValidation = await cart.validateStock();

  res.status(200).json({
    success: true,
    data: stockValidation,
  });
});

// @desc    Merge guest cart with user cart
// @route   POST /api/cart/merge
// @access  Private
export const mergeCart = asyncHandler(async (req, res) => {
  const { guestCart } = req.body;

  if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Guest cart data is required",
    });
  }

  let userCart = await Cart.findOne({ user: req.user.id });

  if (!userCart) {
    userCart = await Cart.create({ user: req.user.id });
  }

  // Merge items from guest cart
  for (const guestItem of guestCart.items) {
    await userCart.addItem(
      guestItem.product,
      guestItem.quantity,
      guestItem.variant
    );
  }

  // Apply guest cart coupon if exists
  if (guestCart.coupon) {
    await userCart.applyCoupon(
      guestCart.coupon.code,
      guestCart.coupon.discount,
      guestCart.coupon.type
    );
  }

  // Set shipping method from guest cart
  if (guestCart.shippingMethod) {
    userCart.shippingMethod = guestCart.shippingMethod;
  }

  await userCart.save();

  const populatedCart = await populateCart(userCart._id);

  res.status(200).json({
    success: true,
    message: "Carts merged successfully",
    data: { cart: populatedCart },
  });
});

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
export const getCartCount = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: { count: 0 },
    });
  }

  const count = cart.getItemCount();

  res.status(200).json({
    success: true,
    data: { count },
  });
});
