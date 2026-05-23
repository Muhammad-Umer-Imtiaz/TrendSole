// middleware/globalErrorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(", ");
  }

  // Duplicate key error (MongoDB)
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate field value: ${JSON.stringify(err.keyValue)}`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (err.name === "MulterError") {
    statusCode = 400;
    message = err.message;
  }

  if (err.name === "ZodError") {
    statusCode = 400;
    message =
      Array.isArray(err.issues) && err.issues.length > 0
        ? err.issues.map((issue: { message: string }) => issue.message).join(", ")
        : "Validation error";
  }

  // JWT error (optional)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
