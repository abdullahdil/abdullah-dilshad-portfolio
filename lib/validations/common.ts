import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);

export const accentSchema = z.enum(["primary", "secondary", "tertiary"]);

export const urlSchema = z.string().url().or(z.literal("")).optional();

export const requiredUrlSchema = z.string().url();

export const emailSchema = z.string().trim().email().max(254);

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
