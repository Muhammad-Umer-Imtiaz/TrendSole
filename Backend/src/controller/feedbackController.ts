import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../errors/AppError.js";
import { Feedback } from "../models/feedbackModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  createFeedbackSchema,
  feedbackStatusSchema,
} from "../validation/feedbackValidation.js";

const parsePositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const serializeFeedback = (feedback: {
  _id: unknown;
  customerId: unknown;
  customerName: string;
  customerEmail: string;
  rating: number;
  subject: string;
  message: string;
  status: "open" | "reviewed" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: String(feedback._id),
  customerId: String(feedback.customerId),
  customerName: feedback.customerName,
  customerEmail: feedback.customerEmail,
  rating: feedback.rating,
  subject: feedback.subject,
  message: feedback.message,
  status: feedback.status,
  createdAt: feedback.createdAt,
  updatedAt: feedback.updatedAt,
});

export const createFeedback = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.authUser) {
      throw new AppError("Authentication required", 401);
    }

    const validatedData = createFeedbackSchema.parse(req.body);
    const feedback = await Feedback.create({
      customerId: req.authUser._id,
      customerName: req.authUser.name,
      customerEmail: req.authUser.email,
      ...validatedData,
      status: "open",
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: serializeFeedback(feedback),
    });
  }
);

export const listFeedback = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = parsePositiveNumber(req.query.limit, 10);
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = search
      ? {
          $or: [
            { customerName: { $regex: search, $options: "i" } },
            { customerEmail: { $regex: search, $options: "i" } },
            { subject: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [feedback, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Feedback.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      feedback: feedback.map((entry) => serializeFeedback(entry)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  }
);

export const listMyFeedback = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.authUser) {
      throw new AppError("Authentication required", 401);
    }

    const feedback = await Feedback.find({ customerId: req.authUser._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      feedback: feedback.map((entry) => serializeFeedback(entry)),
    });
  }
);

export const updateFeedbackStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { status } = feedbackStatusSchema.parse(req.body);
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      throw new AppError("Feedback not found", 404);
    }

    feedback.status = status;
    await feedback.save();

    return res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      feedback: serializeFeedback(feedback),
    });
  }
);
