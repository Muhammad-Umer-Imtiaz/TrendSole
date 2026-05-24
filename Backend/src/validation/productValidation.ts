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

const colorArrayField = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(trimmedValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue;
      }
    } catch {
      return trimmedValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return value;
}, z.array(z.string().trim().min(1, "Color name cannot be empty")).max(12));

const colorVariantArrayField = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(trimmedValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue;
      }
    } catch {
      return value;
    }
  }

  return value;
}, z.array(
  z.object({
    color: z.string().trim().min(1, "Color name is required"),
    stock: z.coerce
      .number()
      .int("Variant stock must be a whole number")
      .min(0, "Variant stock must be greater than or equal to 0"),
  })
).max(12));

const productBaseSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required"),
  productPrice: z.coerce
    .number()
    .min(0, "Product price must be greater than or equal to 0"),
  productCost: z.coerce
    .number()
    .min(0, "Product cost must be greater than or equal to 0"),
  productDescription: z
    .string()
    .trim()
    .min(1, "Product description is required"),
  productCategory: z.string().trim().min(1, "Product category is required"),
  colors: colorArrayField.default([]),
  colorVariants: colorVariantArrayField.default([]),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock must be greater than or equal to 0"),
  discountPercentage: z.coerce
    .number()
    .min(0, "Discount percentage must be between 0 and 100")
    .max(100, "Discount percentage must be between 0 and 100")
    .default(0),
  offerLabel: z.string().trim().max(80).default(""),
  isActive: booleanField,
  isFeatured: booleanField.default(false),
  isNewArrival: booleanField.default(false),
  isBestSeller: booleanField.default(false),
});

export const createProductSchema = productBaseSchema.extend({
  isActive: booleanField.default(true),
  isFeatured: booleanField.default(false),
  isNewArrival: booleanField.default(false),
  isBestSeller: booleanField.default(false),
});

export const updateProductSchema = productBaseSchema.partial();
