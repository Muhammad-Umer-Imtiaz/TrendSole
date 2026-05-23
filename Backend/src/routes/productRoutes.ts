import express, { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controller/productController.js";
import { authorizePermissions, protect } from "../middleware/auth.js";
import { uploadProductImages } from "../middleware/uploadProductImages.js";

const router: Router = express.Router();

router.get("/", getAllProducts);
router.get("/getAllProducts", getAllProducts);
router.get("/:id", getSingleProduct);
router.get("/getSingleProduct/:id", getSingleProduct);
router.post(
  "/",
  protect,
  authorizePermissions("products:create"),
  uploadProductImages.array("productImages", 5),
  createProduct
);
router.post(
  "/createProduct",
  protect,
  authorizePermissions("products:create"),
  uploadProductImages.array("productImages", 5),
  createProduct
);
router.put(
  "/:id",
  protect,
  authorizePermissions("products:update"),
  uploadProductImages.array("productImages", 5),
  updateProduct
);
router.put(
  "/updateProduct/:id",
  protect,
  authorizePermissions("products:update"),
  uploadProductImages.array("productImages", 5),
  updateProduct
);
router.delete("/:id", protect, authorizePermissions("products:delete"), deleteProduct);
router.delete("/deleteProduct/:id", protect, authorizePermissions("products:delete"), deleteProduct);

export default router;
