import { z } from "zod";

const strongPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be 128 characters or less")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessCountry: z.string().optional(),
  businessZip: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  businessWebsite: z.string().url().optional().or(z.literal("")),
  isFreelancer: z.boolean().optional(),
  mobileMoneyProvider: z.string().optional(),
  mobileMoneyNumber: z.string().optional(),
  taxId: z.string().optional(),
  currency: z.string().default("UGX"),
  logoPath: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankBranch: z.string().optional(),
  swiftCode: z.string().optional(),
  paymentNotes: z.string().optional(),
});

export const invoiceSettingsSchema = z.object({
  defaultTemplate: z
    .enum(["CLASSIC", "MODERN", "MINIMAL", "MILESTONE", "RETAINER"])
    .optional(),
  defaultPaymentTerms: z.number().int().min(0).max(365).optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
  defaultTaxLabel: z.string().min(1).optional(),
  defaultCurrency: z.string().min(1).optional(),
  invoicePrefix: z.string().min(1).max(10).optional(),
  defaultFooter: z.string().max(5000).optional(),
  sendCopyToSelf: z.boolean().optional(),
});
