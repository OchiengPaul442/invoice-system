import { z } from "zod";

export const feedbackSchema = z.object({
  category: z.enum(["issue", "enhancement", "general"]),
  subject: z.string().trim().min(4, "Subject is too short").max(120, "Subject is too long"),
  message: z.string().trim().min(12, "Please provide more details").max(4000, "Message is too long"),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

