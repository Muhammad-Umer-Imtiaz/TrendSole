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

const productBaseSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required"),
  productPrice: z.coerce
    .number()
    .min(0, "Product price must be greater than or equal to 0"),
  productDescription: z
    .string()
    .trim()
    .min(1, "Product description is required"),
  productCategory: z.string().trim().min(1, "Product category is required"),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock must be greater than or equal to 0"),
  isActive: booleanField,
});

export const createProductSchema = productBaseSchema.extend({
  isActive: booleanField.default(true),
});

export const updateProductSchema = productBaseSchema.partial();
