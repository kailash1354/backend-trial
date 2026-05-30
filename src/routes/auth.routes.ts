import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/http.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  signupSchema,
} from "../validators/auth.validators.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validateBody(registerSchema), asyncHandler(AuthController.register));
router.post("/signup", validateBody(signupSchema), asyncHandler(AuthController.signup));
router.post("/login", validateBody(loginSchema), asyncHandler(AuthController.login));
router.post("/resend-verification", validateBody(resendVerificationSchema), asyncHandler(AuthController.resendVerification));
router.post("/forgot-password", validateBody(forgotPasswordSchema), asyncHandler(AuthController.forgotPassword));
router.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(AuthController.resetPassword));
router.get("/verify-email", asyncHandler(AuthController.verifyEmail));
router.post("/refresh", asyncHandler(AuthController.refresh));
router.get("/me", requireAuth, asyncHandler(AuthController.me));
router.post("/logout", requireAuth, asyncHandler(AuthController.logout));

export default router;
