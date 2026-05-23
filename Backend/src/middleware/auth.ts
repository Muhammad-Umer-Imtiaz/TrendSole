import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { type IUser } from "../models/userModel.js";
import { getEffectivePermissions, hasAllPermissions } from "../utils/accessControl.js";

export interface AuthenticatedRequest extends Request {
  authUser?: IUser;
  authPermissions?: string[];
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const extractToken = (req: Request) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
};

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for provided token",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
      });
    }

    req.authUser = user;
    req.authPermissions = getEffectivePermissions(user);

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const authorizePermissions =
  (...requiredPermissions: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userPermissions = req.authPermissions ?? [];

    if (!hasAllPermissions(userPermissions, requiredPermissions)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    return next();
  };

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.authUser?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access is required for this action",
    });
  }

  return next();
};
