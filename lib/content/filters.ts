import type { ContentStatus } from "@/lib/supabase/database.types";

export type Publishable = {
  status?: ContentStatus;
  is_published?: boolean;
};

/** Public-safe filter used by repositories and unit tests. */
export function isPubliclyVisible(item: Publishable): boolean {
  if (typeof item.is_published === "boolean") {
    return item.is_published;
  }
  return item.status === "published";
}

export function filterPublished<T extends Publishable>(items: T[]): T[] {
  return items.filter(isPubliclyVisible);
}
