import { z } from "zod";

export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function formBool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function formInt(formData: FormData, key: string, fallback = 0): number {
  const raw = formString(formData, key);
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function arrayToLines(items: string[]): string {
  return items.join("\n");
}

export function parseJsonField<T>(
  text: string,
  schema: z.ZodType<T>,
  fieldLabel: string,
): { ok: true; data: T } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: `${fieldLabel} must be valid JSON.` };
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error: `${fieldLabel}: ${result.error.issues[0]?.message ?? "Invalid value"}`,
    };
  }
  return { ok: true, data: result.data };
}

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed.";
}
