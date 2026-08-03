import { z } from "zod";
import { accentSchema, requiredUrlSchema } from "@/lib/validations/common";

export const templateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(1000),
  externalUrl: requiredUrlSchema,
  tools: z.array(z.string().trim().min(1).max(80)).min(1),
  accent: accentSchema,
  displayOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export type TemplateInput = z.infer<typeof templateSchema>;
