import { Router } from "express";
import { CmsController } from "../controllers/cms.controller.js";
import { asyncHandler } from "../utils/http.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { pageBundleSchema, upsertSchema } from "../validators/cms.validators.js";

const router = Router();

router.post("/public/page-bundle", validateBody(pageBundleSchema), asyncHandler(CmsController.publicBundle));
router.get("/public/home-dynamic", asyncHandler(CmsController.publicHomeDynamic));
router.get("/public/location-dynamic", asyncHandler(CmsController.publicLocationDynamic));
router.get("/public/investment-dynamic", asyncHandler(CmsController.publicInvestmentDynamic));
router.get("/public/gallery-dynamic", asyncHandler(CmsController.publicGalleryDynamic));
router.get("/public/floor-plans-dynamic", asyncHandler(CmsController.publicFloorPlansDynamic));
router.get("/public/amenities-dynamic", asyncHandler(CmsController.publicAmenitiesDynamic));
router.get("/public/developer-dynamic", asyncHandler(CmsController.publicDeveloperDynamic));
router.get("/admin/collections", requireAuth, requireRole(["admin"]), asyncHandler(CmsController.adminCollections));
router.post("/admin/site-settings", requireAuth, requireRole(["admin"]), validateBody(upsertSchema), asyncHandler(CmsController.upsertSiteSettings));
router.post("/admin/navigation", requireAuth, requireRole(["admin"]), validateBody(upsertSchema), asyncHandler(CmsController.upsertNavigation));
router.post("/admin/navigation/delete", requireAuth, requireRole(["admin"]), asyncHandler(CmsController.deleteNavigation));
router.post("/admin/section", requireAuth, requireRole(["admin"]), validateBody(upsertSchema), asyncHandler(CmsController.upsertSection));
router.post("/admin/testimonial", requireAuth, requireRole(["admin"]), validateBody(upsertSchema), asyncHandler(CmsController.upsertTestimonial));
router.post("/admin/testimonial/delete", requireAuth, requireRole(["admin"]), asyncHandler(CmsController.deleteTestimonial));
router.post("/admin/seo", requireAuth, requireRole(["admin"]), validateBody(upsertSchema), asyncHandler(CmsController.upsertSeo));
router.post("/admin/property", requireAuth, requireRole(["admin"]), validateBody(upsertSchema), asyncHandler(CmsController.upsertProperty));

export default router;
