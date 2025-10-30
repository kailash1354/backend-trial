import express from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middleware/auth.js";
import { validationErrorHandler } from "../middleware/errorHandler.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  adminGetAllOrders,
  adminGetOrderStats,
  adminUpdateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// --- Validation Groups ---

const createOrderValidation = [
  body("shippingAddress")
    .isObject()
    .withMessage("Shipping address is required"),
  body("shippingAddress.firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),
  body("shippingAddress.lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),
  body("shippingAddress.address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("shippingAddress.state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),
  body("shippingAddress.zipCode")
    .trim()
    .notEmpty()
    .withMessage("ZIP code is required"),
  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
  body("paymentInfo.method")
    .isIn(["card", "paypal", "apple_pay", "google_pay", "bank_transfer"])
    .withMessage("Invalid payment method"),
  validationErrorHandler,
];

const updateStatusValidation = [
  body("status")
    .isIn([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ])
    .withMessage("Invalid order status"),
  body("trackingNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tracking number cannot be empty if provided"),
  validationErrorHandler,
];

// --- User Routes (Protected) ---
router.use(protect);

router.route("/").post(createOrderValidation, createOrder).get(getUserOrders);

router.route("/:id").get(getOrderById);

router.route("/:id/cancel").put(cancelOrder);

// --- Admin Routes (Protected & Authorized) ---
router.get("/admin/all", authorize("admin"), adminGetAllOrders);
router.get("/admin/stats", authorize("admin"), adminGetOrderStats);
router.put(
  "/:id/status",
  authorize("admin"),
  updateStatusValidation,
  adminUpdateOrderStatus
);

export default router;
