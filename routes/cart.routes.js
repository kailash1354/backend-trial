import express from "express";
import { body } from "express-validator";
import { protect, optionalAuth } from "../middleware/auth.js";
import { validationErrorHandler } from "../middleware/errorHandler.js";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  updateShippingMethod,
  validateStock,
  mergeCart,
  getCartCount,
} from "../controllers/cart.controller.js";

const router = express.Router();

// All routes here are protected
router.use(protect);

// Validation for adding items
const itemValidation = [
  body("productId")
    .isMongoId()
    .withMessage("Please provide a valid product ID"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  validationErrorHandler,
];

// Validation for updating quantity
const quantityValidation = [
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),
  validationErrorHandler,
];

// Validation for coupons
const couponValidation = [
  body("code").trim().notEmpty().withMessage("Coupon code is required"),
  body("discount")
    .isFloat({ min: 0 })
    .withMessage("Discount must be a positive number"),
  body("type")
    .isIn(["percentage", "fixed"])
    .withMessage("Coupon type must be percentage or fixed"),
  validationErrorHandler,
];

// Validation for shipping
const shippingValidation = [
  body("method")
    .isIn(["standard", "express", "overnight"])
    .withMessage("Invalid shipping method"),
  validationErrorHandler,
];

// Cart routes
router.route("/").get(getCart).delete(clearCart);

router.route("/items").post(itemValidation, addItemToCart);

router
  .route("/items/:productId")
  .put(quantityValidation, updateCartItem)
  .delete(removeCartItem);

router
  .route("/coupon")
  .post(couponValidation, applyCoupon)
  .delete(removeCoupon);

router.route("/shipping").put(shippingValidation, updateShippingMethod);

router.route("/validate").get(validateStock);

router.route("/merge").post(mergeCart);

router.route("/count").get(getCartCount);

export default router;
