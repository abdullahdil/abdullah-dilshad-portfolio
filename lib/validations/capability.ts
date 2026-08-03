import { z } from "zod";

export const capabilitySchema = z.object({
  category: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).default(""),
  displayOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export type CapabilityInput = z.infer<typeof capabilitySchema>;
