import express from "express";
import { validate } from "../middleware/validate.js";
import {
  authorizePermissions,
  protect,
  requireAdmin,
} from "../middleware/auth.js";
import {
  customerCreateSchema,
  loginSchema,
  signupSchema,
  userRegistrationSchema,
} from "../validation/userValidation.js";
import {
  createCustomer,
  deleteCustomer,
  forgetPassword,
  getCurrentUser,
  getPermissionCatalog,
  listCustomers,
  listStaff,
  listUsers,
  login,
  logout,
  otpVerificationForRegistration,
  resetPassword,
  signup,
  updateCustomer,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
  updateUserPermissions,
  updateUserRole,
  userRegistration,
} from "../controller/userController.js";


const router = express.Router();

router.post(
  "/register",
  validate(userRegistrationSchema),
  userRegistration
);
router.post("/signup", validate(signupSchema), signup);
router.post("/verifyOtp",otpVerificationForRegistration)
router.post("/login",validate(loginSchema),login)
router.post("/logout",logout);
router.post("/forget-password",forgetPassword)
router.post("/reset-password/:token",resetPassword)

router.use(protect);

router.get("/permission-catalog", authorizePermissions("staff:manage"), getPermissionCatalog);
router.get("/me", getCurrentUser);
router.put("/me/profile", updateCurrentUserProfile);
router.put("/me/password", updateCurrentUserPassword);
router.get("/", authorizePermissions("users:manage"), listUsers);
router.get("/customers", authorizePermissions("customers:read"), listCustomers);
router.post(
  "/customers",
  authorizePermissions("customers:manage"),
  validate(customerCreateSchema),
  createCustomer
);
router.put("/customers/:id", authorizePermissions("customers:manage"), updateCustomer);
router.delete("/customers/:id", authorizePermissions("customers:manage"), deleteCustomer);
router.get("/staff", authorizePermissions("users:manage"), listStaff);
router.put("/:id/role", requireAdmin, authorizePermissions("staff:manage"), updateUserRole);
router.put(
  "/:id/permissions",
  requireAdmin,
  authorizePermissions("staff:manage"),
  updateUserPermissions
);

export default router;
