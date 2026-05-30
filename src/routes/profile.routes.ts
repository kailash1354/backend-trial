import { Router } from "express";
import { asyncHandler } from "../utils/http.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { ProfileController } from "../controllers/profile.controller.js";
import { requestVisitSchema, toggleInterestSchema, updateProfileSchema } from "../validators/profile.validators.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/dashboard", asyncHandler(ProfileController.dashboard));
router.get("/me", asyncHandler(ProfileController.me));
router.patch("/me", validateBody(updateProfileSchema), asyncHandler(ProfileController.update));
router.get("/interests", asyncHandler(ProfileController.interests));
router.post("/interests/toggle", validateBody(toggleInterestSchema), asyncHandler(ProfileController.toggleInterest));
router.get("/site-visits", asyncHandler(ProfileController.siteVisits));
router.post("/site-visits", validateBody(requestVisitSchema), asyncHandler(ProfileController.requestSiteVisit));
router.get("/documents", asyncHandler(ProfileController.documents));
router.get("/investment-updates", asyncHandler(ProfileController.updates));
router.get("/support", asyncHandler(ProfileController.support));

export default router;
