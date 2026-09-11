import { z } from "zod";
import { emailSchema } from "@/lib/validations/common";

export const workflowAccessRequestSchema = z.object({
  workflowId: z.string().trim().min(1).max(200),
  workflowTitle: z.string().trim().min(1).max(300),
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: emailSchema,
  company: z.string().trim().max(160).optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  /** Honeypot — must be empty */
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export type WorkflowAccessRequestInput = z.infer<
  typeof workflowAccessRequestSchema
>;
