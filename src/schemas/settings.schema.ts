import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
  taxId: z.string().optional(),
  currency: z.string().default("UGX"),
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
