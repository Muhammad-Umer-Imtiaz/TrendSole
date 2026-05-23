import { z } from "zod";

const booleanField = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "true") {
      return true;
    }

    if (normalizedValue === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

const categoryBaseSchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  description: z.string().trim().optional().default(""),
  isActive: booleanField.default(true),
});

export const createCategorySchema = categoryBaseSchema;

export const updateCategorySchema = categoryBaseSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "Provide at least one field to update"
);
