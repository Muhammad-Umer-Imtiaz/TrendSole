import type { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User, { type IUser, type UserRole } from "../models/userModel.js";
import {
  customerCreateSchema,
  customerUpdateSchema,
  loginSchema,
  passwordUpdateSchema,
  profileUpdateSchema,
  signupSchema,
  userPermissionsUpdateSchema,
  userRegistrationSchema,
  userRoleUpdateSchema,
} from "../validation/userValidation.js";
import { otpGenerate } from "../utils/otpGenerate.js";
import { sendEmail } from "../utils/emailService.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import {
  getDefaultPermissions,
  getEffectivePermissions,
  isValidPermission,
  PERMISSION_GROUPS,
  ROLE_PERMISSION_PRESETS,
} from "../utils/accessControl.js";

const parsePositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const serializeUser = (user: IUser) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone ?? "",
  address: user.address ?? "",
  permissions: getEffectivePermissions(user),
  isActive: user.isActive,
  isVerified: user.isVerified,
  lastActive: user.updatedAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  totalOrders: 0,
  totalSpent: 0,
});

const createAuthToken = (user: IUser) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

const buildAuthResponse = (user: IUser) => ({
  token: createAuthToken(user),
  user: {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? "",
    address: user.address ?? "",
  },
  permissions: getEffectivePermissions(user),
});

export const userRegistration = async (req: Request, res: Response) => {
  try {
    const validatedData = userRegistrationSchema.parse(req.body);
    const { name, email, password, role, phone } = validatedData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = otpGenerate(6);
    await sendEmail({
      to: email,
      subject: "Verification Email",
      html: otp,
    });

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const newUser = new User({
      name,
      email,
      password,
      role,
      phone,
      otp,
      otpExpiry,
      permissions: role ? getDefaultPermissions(role) : [],
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error: any) {
    console.error("Error registering user:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const otpVerificationForRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({ otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid Otp" });
    }

    if (!user.otpExpiry) {
      return res.status(400).json({ message: "Otp expiry not found" });
    }

    if (user.otpExpiry.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;
    user.isActive = true;

    await user.save();

    const authResponse = buildAuthResponse(user);

    return res
      .cookie("authToken", authResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "OTP verified successfully",
        ...authResponse,
      });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const existingUser = await User.findOne({ email: validatedData.email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      ...validatedData,
      role: "customer",
      permissions: getDefaultPermissions("customer"),
      isVerified: true,
      isActive: true,
      otp: null,
      otpExpiry: null,
    });
    const authResponse = buildAuthResponse(user);

    return res
      .cookie("authToken", authResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "Account created successfully",
        ...authResponse,
      });
  } catch (error: any) {
    console.error("Error signing up user:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account is inactive" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account first" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const authResponse = buildAuthResponse(user);

    return res
      .cookie("authToken", authResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "User logged in successfully",
        ...authResponse,
      });
  } catch (error: any) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("authToken");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error: any) {
    console.error("Error logging out user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.authUser) {
    return res.status(401).json({ message: "Authentication required" });
  }

  return res.status(200).json({
    success: true,
    user: serializeUser(req.authUser),
  });
};

export const updateCurrentUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = profileUpdateSchema.parse(req.body);
    const user = await User.findById(req.authUser._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (validatedData.name !== undefined) {
      user.name = validatedData.name;
    }

    if (validatedData.phone !== undefined) {
      user.phone = validatedData.phone;
    }

    if (validatedData.address !== undefined) {
      user.address = validatedData.address;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: serializeUser(user),
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateCurrentUserPassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = passwordUpdateSchema.parse(req.body);
    const user = await User.findById(req.authUser._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPermissionCatalog = async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    groups: PERMISSION_GROUPS,
    rolePresets: ROLE_PERMISSION_PRESETS,
  });
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const page = parsePositiveNumber(_req.query.page, 1);
    const limit = parsePositiveNumber(_req.query.limit, 10);
    const search =
      typeof _req.query.search === "string" ? _req.query.search.trim() : "";
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users: users.map(serializeUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listCustomers = async (_req: Request, res: Response) => {
  try {
    const page = parsePositiveNumber(_req.query.page, 1);
    const limit = parsePositiveNumber(_req.query.limit, 10);
    const search =
      typeof _req.query.search === "string" ? _req.query.search.trim() : "";
    const filter = search
      ? {
          role: "customer",
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : { role: "customer" };
    const [customers, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      customers: customers.map(serializeUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const validatedData = customerCreateSchema.parse(req.body);
    const existingUser = await User.findOne({ email: validatedData.email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const customer = await User.create({
      ...validatedData,
      permissions: getDefaultPermissions(validatedData.role),
      isVerified: true,
      otp: null,
      otpExpiry: null,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: serializeUser(customer),
    });
  } catch (error: any) {
    console.error("Error creating customer:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const validatedData = customerUpdateSchema.parse(req.body);
    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (validatedData.email && validatedData.email !== customer.email) {
      const existingUser = await User.findOne({ email: validatedData.email });

      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    if (validatedData.name !== undefined) {
      customer.name = validatedData.name;
    }

    if (validatedData.email !== undefined) {
      customer.email = validatedData.email;
    }

    if (validatedData.password !== undefined) {
      customer.password = validatedData.password;
    }

    if (validatedData.phone !== undefined) {
      customer.phone = validatedData.phone;
    }

    if (validatedData.address !== undefined) {
      customer.address = validatedData.address;
    }

    if (validatedData.isActive !== undefined) {
      customer.isActive = validatedData.isActive;
    }

    if (validatedData.role !== undefined) {
      customer.role = validatedData.role;
      customer.permissions = getDefaultPermissions(validatedData.role);
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: serializeUser(customer),
    });
  } catch (error: any) {
    console.error("Error updating customer:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await customer.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listStaff = async (_req: Request, res: Response) => {
  try {
    const page = parsePositiveNumber(_req.query.page, 1);
    const limit = parsePositiveNumber(_req.query.limit, 10);
    const search =
      typeof _req.query.search === "string" ? _req.query.search.trim() : "";
    const filter = {
      role: {
        $in: ["manager", "sales_staff"],
      },
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };
    const [staff, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      staff: staff.map(serializeUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching staff:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = userRoleUpdateSchema.parse(req.body);
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    user.permissions = getDefaultPermissions(role);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: serializeUser(user),
    });
  } catch (error: any) {
    console.error("Error updating role:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUserPermissions = async (req: Request, res: Response) => {
  try {
    const { permissions } = userPermissionsUpdateSchema.parse(req.body);
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const invalidPermissions = permissions.filter(
      (permission) => !isValidPermission(permission)
    );

    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        message: `Invalid permission keys: ${invalidPermissions.join(", ")}`,
      });
    }

    user.permissions = [...new Set(permissions)];

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      user: serializeUser(user),
    });
  } catch (error: any) {
    console.error("Error updating permissions:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: `Reset your password using this link: ${resetLink}`,
    });

    return res.status(200).json({
      message: "Password reset link sent to email",
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || Array.isArray(token)) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = "";
    user.resetPasswordExpiry = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
