import express, { Router } from "express";
import {
  createFeedback,
  listFeedback,
  listMyFeedback,
  updateFeedbackStatus,
} from "../controller/feedbackController.js";
import { authorizePermissions, protect } from "../middleware/auth.js";

const router: Router = express.Router();

router.use(protect);

router.get("/my", listMyFeedback);
router.post("/", createFeedback);
router.get("/", authorizePermissions("customers:read"), listFeedback);
router.patch(
  "/:id/status",
  authorizePermissions("customers:manage"),
  updateFeedbackStatus
);

export default router;
