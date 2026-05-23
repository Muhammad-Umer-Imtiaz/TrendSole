import { z } from "zod";

const userRoleSchema = z.enum(["admin", "manager", "sales_staff", "customer"]);

export const userRegistrationSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: userRoleSchema.optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});


export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export const customerCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  role: userRoleSchema.default("customer"),
  isActive: z.boolean().optional().default(true),
});

export const customerUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name is required").optional(),
  email: z.string().trim().email("Invalid email format").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
}).refine(
  (payload) => Object.keys(payload).length > 0,
  "Provide at least one field to update"
);

export const userRoleUpdateSchema = z.object({
  role: userRoleSchema,
});

export const userPermissionsUpdateSchema = z.object({
  permissions: z.array(z.string().trim().min(1, "Permission key is required")),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name is required").optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
}).refine(
  (payload) => Object.keys(payload).length > 0,
  "Provide at least one field to update"
);

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
