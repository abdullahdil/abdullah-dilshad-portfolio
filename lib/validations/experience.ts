import { z } from "zod";

export const experienceSchema = z
  .object({
    organization: z.string().trim().min(1).max(160),
    role: z.string().trim().min(1).max(160),
    location: z.string().trim().min(1).max(120),
    startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    endDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
    isCurrent: z.boolean(),
    description: z.string().trim().min(1).max(2000),
    displayOrder: z.number().int().min(0).max(9999),
    isPublished: z.boolean(),
  })
  .refine((value) => value.isCurrent || Boolean(value.endDate), {
    message: "End date is required when the role is not current",
    path: ["endDate"],
  });

export type ExperienceInput = z.infer<typeof experienceSchema>;
