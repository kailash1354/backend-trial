import { Router } from "express";
import { MediaController } from "../controllers/media.controller.js";
import { asyncHandler } from "../utils/http.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { upload } from "../storage/multer.storage.js";

const router = Router();

router.get("/assets", requireAuth, requireRole(["admin"]), asyncHandler(MediaController.list));
router.post("/upload", requireAuth, requireRole(["admin"]), upload.single("file"), asyncHandler(MediaController.upload));

export default router;
