import { z } from "zod";
import { emailSchema } from "@/lib/validations/common";

export const opportunityTypeSchema = z.enum([
  "Full-time remote role",
  "Long-term contract",
  "Automation project",
  "Collaboration",
  "Other",
]);

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
  company: z.string().trim().max(160).optional().or(z.literal("")),
  opportunityType: opportunityTypeSchema,
  message: z.string().trim().min(1).max(5000),
  /** Honeypot — must be empty */
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
