import express from "express";
import {
  getAnalyticsOverview,
  getDashboardOverview,
} from "../controller/dashboardController.js";
import { authorizePermissions, protect } from "../middleware/auth.js";

const dashboardRouter = express.Router();
const analyticsRouter = express.Router();

dashboardRouter.use(protect);
analyticsRouter.use(protect);

dashboardRouter.get(
  "/overview",
  authorizePermissions("dashboard:view"),
  getDashboardOverview
);
analyticsRouter.get(
  "/overview",
  authorizePermissions("analytics:view"),
  getAnalyticsOverview
);

export { analyticsRouter, dashboardRouter };
