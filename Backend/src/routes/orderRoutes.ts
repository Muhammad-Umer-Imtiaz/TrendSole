import express from "express";
import {
  createOrder,
  listMyOrders,
  listOrders,
  updateOrderStatus,
} from "../controller/orderController.js";
import { authorizePermissions, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/my", listMyOrders);
router.post("/", createOrder);
router.get("/", authorizePermissions("orders:read"), listOrders);
router.patch("/:id/status", authorizePermissions("orders:update"), updateOrderStatus);
router.patch("/:id", authorizePermissions("orders:update"), updateOrderStatus);

export default router;
