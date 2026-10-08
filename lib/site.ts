import { profileSeed } from "@/lib/content/seed";

const DEV_SITE_URL = "http://localhost:3000";

function withProtocol(host: string): string {
  const trimmed = host.replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Canonical origin for absolute URLs (metadataBase, sitemap, JSON-LD).
 *
 * Order: explicit NEXT_PUBLIC_SITE_URL → Vercel's stable production domain
 * (VERCEL_PROJECT_PRODUCTION_URL — never VERCEL_URL, which is a per-deploy
 * host and would leak preview hosts into canonicals) → localhost in dev.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return withProtocol(fromEnv);

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return withProtocol(production);

  return DEV_SITE_URL;
}

/**
 * One identity sentence reused by every surface (meta, JSON-LD, OG images,
 * llms.txt) so search engines see a single consistent entity. Leads with the
 * outcome and the breadth — n8n is evidence, never the identity
 * (CONTENT_TRUTH.md → Positioning rules).
 */
const identity =
  "AI Automation Engineer building production automation that connects AI models, APIs and business systems.";

/** ~150-char meta description (search snippets truncate around 155-160). */
const seoDescription =
  "AI Automation Engineer in Islamabad building production systems that connect AI models, APIs and business tools, with fallbacks and human approval.";

export const siteConfig = {
  name: profileSeed.fullName,
  /** Short role used in titles: "Abdullah Dilshad | AI Automation Engineer". */
  role: "AI Automation Engineer",
  title: `${profileSeed.fullName} | AI Automation Engineer`,
  identity,
  seoDescription,
  /** Long-form description (hero copy) — not for meta tags. */
  description: profileSeed.heroDescription,
  email: profileSeed.email,
  locale: "en_US",
  twitterHandle: "@Abdullahdilsha7",
} as const;
