import { z } from "zod";
import {
  accentSchema,
  contentStatusSchema,
  slugSchema,
} from "@/lib/validations/common";

export const architectureNodeSchema = z.object({
  label: z.string().trim().min(1).max(80),
  detail: z.string().trim().min(1).max(160),
});

export const caseStudyStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(2000),
});

export const caseStudyToolSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().max(80).optional(),
});

export const reliabilityControlSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
});

export const galleryImageSchema = z.object({
  url: z.string().url().or(z.literal("")).optional(),
  caption: z.string().trim().min(1).max(160),
  alt: z.string().trim().max(160).optional(),
});

export const caseStudySchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: slugSchema,
  summary: z.string().trim().min(1).max(600),
  businessProblem: z.string().trim().min(1).max(2000),
  beforeState: z.string().trim().min(1).max(2000),
  beforeIssues: z.array(z.string().trim().min(1).max(400)).min(1),
  architectureDescription: z.string().trim().min(1).max(4000),
  architectureNodes: z.array(architectureNodeSchema).min(1),
  steps: z.array(caseStudyStepSchema).min(1),
  tools: z.array(caseStudyToolSchema).min(1),
  contribution: z.array(z.string().trim().min(1).max(120)).min(1),
  reliabilityControls: z.array(reliabilityControlSchema).min(1),
  result: z.string().trim().min(1).max(2000),
  accent: accentSchema,
  previewLabel: z.string().trim().min(1).max(80),
  status: contentStatusSchema,
  featuredImageUrl: z
    .string()
    .url()
    .or(z.literal(""))
    .nullable()
    .optional(),
  demoVideoUrl: z.string().url().or(z.literal("")).nullable().optional(),
  galleryImages: z.array(galleryImageSchema).default([]),
  galleryPlaceholders: z.array(z.string().trim().min(1).max(160)).default([]),
  demoVideoLabel: z.string().trim().min(1).max(80).default("Demo video coming soon"),
});

export type CaseStudyInput = z.infer<typeof caseStudySchema>;
