import { z } from "zod";

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1, "Product is required"),
        quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "Order must include at least one item"),
  contactPhone: z.string().trim().min(1, "Phone number is required"),
  shippingAddress: z.string().trim().min(5, "Shipping address is required"),
  notes: z.string().trim().optional(),
});
