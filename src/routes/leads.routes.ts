import { Router } from "express";
import { LeadsController } from "../controllers/leads.controller.js";
import { asyncHandler } from "../utils/http.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { leadDeleteSchema, leadStatusSchema, leadSubmitSchema } from "../validators/leads.validators.js";

const router = Router();

router.post("/submit", validateBody(leadSubmitSchema), asyncHandler(LeadsController.submit));
router.get("/admin", requireAuth, requireRole(["admin"]), asyncHandler(LeadsController.list));
router.post(
  "/admin/status",
  requireAuth,
  requireRole(["admin"]),
  validateBody(leadStatusSchema),
  asyncHandler(LeadsController.updateStatus),
);
router.post(
  "/admin/delete",
  requireAuth,
  requireRole(["admin"]),
  validateBody(leadDeleteSchema),
  asyncHandler(LeadsController.remove),
);

export default router;
