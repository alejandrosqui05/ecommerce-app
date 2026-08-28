import { Router } from "express";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listCategories); // público: para la barra de filtros
router.post("/", requireAuth, createCategory);
router.put("/:id", requireAuth, updateCategory);
router.delete("/:id", requireAuth, deleteCategory);

export default router;
