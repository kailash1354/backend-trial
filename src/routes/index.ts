import { Router } from "express";
import authRoutes from "./auth.routes.js";
import cmsRoutes from "./cms.routes.js";
import mediaRoutes from "./media.routes.js";
import formsRoutes from "./forms.routes.js";
import leadsRoutes from "./leads.routes.js";
import profileRoutes from "./profile.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cms", cmsRoutes);
router.use("/media", mediaRoutes);
router.use("/forms", formsRoutes);
router.use("/leads", leadsRoutes);
router.use("/profile", profileRoutes);

export default router;
