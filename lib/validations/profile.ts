import { z } from "zod";
import { emailSchema, urlSchema } from "@/lib/validations/common";

export const availabilityStatusSchema = z.enum([
  "available",
  "limited",
  "unavailable",
]);

export const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  professionalTitle: z.string().trim().min(1).max(160),
  heroHeadline: z.string().trim().min(1).max(200),
  heroDescription: z.string().trim().min(1).max(600),
  shortBio: z.string().trim().max(400),
  longBio: z.array(z.string().trim().min(1).max(2000)).min(1),
  location: z.string().trim().min(1).max(120),
  availabilityStatus: availabilityStatusSchema,
  availabilityLabel: z.string().trim().min(1).max(80),
  email: emailSchema,
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  n8nProfileUrl: urlSchema,
  credentialUrl: urlSchema,
  cvUrl: z.string().trim().max(500).optional(),
  portraitUrl: urlSchema,
});
