import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long."),
});

export const signupFormSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters."),
    email: z.string().trim().email("Please enter a valid email address."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long."),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters long."),
    agreedToTerms: z.boolean().refine((value) => value, {
      message: "Please accept the terms before continuing.",
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordFormSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export const otpFormSchema = z.object({
  otp: z
    .string()
    .regex(/^\d{6}$/, "Please enter the complete 6-digit OTP."),
});

export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long."),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters long."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
