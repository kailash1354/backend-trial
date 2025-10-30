import express from "express";
import { body } from "express-validator";
import { validationErrorHandler } from "../middleware/errorHandler.js";
import { protect } from "../middleware/auth.js"; // We need protect for the 'me' route
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  resendVerification, // <--- NEW IMPORT
} from "../controllers/auth.controller.js";

const router = express.Router();

// --- Validation Groups ---

const registerValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  validationErrorHandler,
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validationErrorHandler,
];

const passwordResetValidation = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  validationErrorHandler,
];

// --- Public Auth Routes ---
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refreshToken);
router.post("/verify-email", verifyEmail);

// NEW ROUTE: Resend Verification
router.post(
  "/resend-verification", // <--- NEW ROUTE PATH
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    validationErrorHandler,
  ],
  resendVerification // <--- NEW CONTROLLER FUNCTION
);

router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    validationErrorHandler,
  ],
  forgotPassword
);

router.post("/reset-password", passwordResetValidation, resetPassword);

// --- Private Auth Routes ---
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
