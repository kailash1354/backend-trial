import { Router } from "express";
import { FormsController } from "../controllers/forms.controller.js";
import { asyncHandler } from "../utils/http.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/submit", asyncHandler(FormsController.submit));
router.get("/definitions", requireAuth, requireRole(["admin"]), asyncHandler(FormsController.listForms));
router.post("/definitions", requireAuth, requireRole(["admin"]), asyncHandler(FormsController.upsertForm));
router.get("/submissions", requireAuth, requireRole(["admin"]), asyncHandler(FormsController.listSubmissions));

export default router;
