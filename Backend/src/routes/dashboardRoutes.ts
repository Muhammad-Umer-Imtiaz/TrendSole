import express, { Router } from "express";
import {
  getAnalyticsOverview,
  getDashboardOverview,
} from "../controller/dashboardController.js";
import { authorizePermissions, protect } from "../middleware/auth.js";

const dashboardRouter: Router = express.Router();
const analyticsRouter: Router = express.Router();

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
