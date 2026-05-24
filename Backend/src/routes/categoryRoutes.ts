import express from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controller/categoryController.js";
import { authorizePermissions, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listCategories);
router.post("/", protect, authorizePermissions("categories:create"), createCategory);
router.put("/:id", protect, authorizePermissions("categories:update"), updateCategory);
router.delete("/:id", protect, authorizePermissions("categories:delete"), deleteCategory);

export default router;
