import { z } from "zod";
import { availabilityStatusSchema } from "@/lib/validations/profile";

export const siteSettingsSchema = z.object({
  availabilityStatus: availabilityStatusSchema,
  availabilityLabel: z.string().trim().min(1).max(80),
  responseTimeNote: z.string().trim().max(200).default(""),
  footerNote: z.string().trim().max(200).default(""),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
