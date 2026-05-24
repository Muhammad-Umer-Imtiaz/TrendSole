import { z } from "zod";

export const createFeedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  subject: z.string().trim().min(3, "Subject is required"),
  message: z.string().trim().min(10, "Feedback message is too short"),
});

export const feedbackStatusSchema = z.object({
  status: z.enum(["open", "reviewed", "resolved"]),
});
