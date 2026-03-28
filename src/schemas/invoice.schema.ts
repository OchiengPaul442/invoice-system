import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
  taxable: z.boolean().default(true),
});

export const milestoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  dueDate: z.string(),
  amount: z.number().min(0),
  status: z.enum(["pending", "completed", "invoiced"]),
});

export const invoiceCreateSchema = z.object({
  clientId: z.string().optional(),
  invoiceNumber: z.string().max(50).optional(),
  templateType: z.enum([
    "CLASSIC",
    "MODERN",
    "MINIMAL",
    "MILESTONE",
    "RETAINER",
  ]),
  billingType: z.enum(["HOURLY", "FIXED", "RETAINER", "MILESTONE", "LICENSE"]),
  issueDate: z.string(),
  dueDate: z.string(),
  servicePeriodStart: z.string().optional(),
  servicePeriodEnd: z.string().optional(),
  billToName: z.string().min(1, "Client name required"),
  billToEmail: z.string().email("Valid email required"),
  billToCompany: z.string().optional(),
  billToAddress: z.string().optional(),
  billToCity: z.string().optional(),
  billToCountry: z.string().optional(),
  billToTaxId: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
  milestones: z.array(milestoneSchema).optional(),
  currency: z.string().default("UGX"),
  discountType: z.enum(["percent", "fixed"]).optional(),
  discountValue: z.number().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxLabel: z.string().default("VAT"),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  notes: z.string().optional(),
  footer: z.string().optional(),
  paymentTerms: z.string().optional(),
  paymentInstructions: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  showLogo: z.boolean().default(true),
  status: z
    .enum([
      "DRAFT",
      "SENT",
      "VIEWED",
      "PARTIAL",
      "PAID",
      "OVERDUE",
      "CANCELLED",
    ])
    .optional(),
});

export const invoiceUpdateSchema = invoiceCreateSchema.partial();
