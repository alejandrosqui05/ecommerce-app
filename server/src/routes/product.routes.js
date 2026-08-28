import { Router } from "express";
import {
  listPublicProducts,
  listAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  bulkSetActive,
} from "../controllers/product.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Público
router.get("/", listPublicProducts);

// Admin
router.get("/admin/all", requireAuth, listAdminProducts);
router.patch("/bulk", requireAuth, bulkSetActive);
router.post("/", requireAuth, upload.single("image"), createProduct);
router.put("/:id", requireAuth, upload.single("image"), updateProduct);
router.patch("/:id/toggle", requireAuth, toggleAvailability);
router.delete("/:id", requireAuth, deleteProduct);

export default router;
