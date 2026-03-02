import { z } from "zod";

export const clientCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  company: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  defaultCurrency: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export const clientUpdateSchema = clientCreateSchema.partial();
