import { Router } from "express";
import {
  listPublicBanners,
  listAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
} from "../controllers/banner.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Público
router.get("/", listPublicBanners);

// Admin
router.get("/admin/all", requireAuth, listAdminBanners);
router.post("/", requireAuth, upload.single("image"), createBanner);
router.put("/:id", requireAuth, upload.single("image"), updateBanner);
router.patch("/:id/toggle", requireAuth, toggleBannerActive);
router.delete("/:id", requireAuth, deleteBanner);

export default router;
