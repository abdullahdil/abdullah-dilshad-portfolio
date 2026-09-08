import { z } from "zod";

/** Icon names accepted by the hero workflow visual (lucide-react). */
export const heroWorkflowIcons = [
  "Webhook",
  "Database",
  "Brain",
  "UserCheck",
  "Send",
  "Workflow",
  "Plug",
  "Terminal",
  "Bot",
  "Filter",
  "Mail",
  "ShieldCheck",
] as const;

export const proofPointSchema = z.object({
  value: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(300),
  isFeatured: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export const heroWorkflowStepSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(300).default(""),
  icon: z.enum(heroWorkflowIcons),
  displayOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export const navLinkSchema = z.object({
  // Section anchors ("/#work"), internal routes ("/resume") and absolute URLs.
  href: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
      "Link must start with / or be a full http(s) URL.",
    ),
  label: z.string().trim().min(1).max(60),
  displayOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export const workflowGroupSchema = z.object({
  category: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).default(""),
  displayOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export const workflowSchema = z.object({
  groupId: z.string().uuid("Pick a category for this workflow."),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase words separated by single hyphens.",
    ),
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(1000).default(""),
  // Empty string clears the image; otherwise any http(s) URL (uploads resolve
  // to a Supabase public URL).
  imageUrl: z
    .string()
    .trim()
    .max(600)
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value),
      "Image must be a full http(s) URL.",
    )
    .default(""),
  imageAlt: z.string().trim().max(200).default(""),
  outcomeTags: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export type ProofPointInput = z.infer<typeof proofPointSchema>;
export type HeroWorkflowStepInput = z.infer<typeof heroWorkflowStepSchema>;
export type NavLinkInput = z.infer<typeof navLinkSchema>;
export type WorkflowGroupInput = z.infer<typeof workflowGroupSchema>;
export type WorkflowInput = z.infer<typeof workflowSchema>;
