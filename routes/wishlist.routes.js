import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import { validationErrorHandler } from "../middleware/errorHandler.js";
import {
  getWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
  clearWishlist,
  updateWishlistItem,
  checkWishlistItem,
  moveWishlistItemToCart,
  getSharedWishlist,
  generateShareToken,
  revokeShareToken,
  updateWishlistSettings,
  getItemsByPriority,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

// --- Validation Groups ---

const addItemValidation = [
  body("productId")
    .isMongoId()
    .withMessage("Please provide a valid product ID"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  validationErrorHandler,
];

const updateItemValidation = [
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  validationErrorHandler,
];

const moveToCartValidation = [
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  validationErrorHandler,
];

const settingsValidation = [
  body("name")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Wishlist name must be between 1 and 100 characters"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  validationErrorHandler,
];

// --- Public Routes ---

// Get a shared wishlist
router.get("/shared/:token", getSharedWishlist);

// --- Protected Routes ---

// All routes below this require a user to be logged in
router.use(protect);

router.route("/").get(getWishlist).delete(clearWishlist);

router.route("/items").post(addItemValidation, addItemToWishlist);

router
  .route("/items/:productId")
  .delete(removeItemFromWishlist)
  .put(updateItemValidation, updateWishlistItem);

router.route("/check/:productId").get(checkWishlistItem);

router
  .route("/move-to-cart/:productId")
  .post(moveToCartValidation, moveWishlistItemToCart);

router.route("/share").post(generateShareToken).delete(revokeShareToken);

router.route("/settings").put(settingsValidation, updateWishlistSettings);

router.route("/priority/:priority").get(getItemsByPriority);

export default router;
