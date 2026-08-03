import { profileSeed } from "@/lib/content/seed";

const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/\/$/, "");
    return host.startsWith("http") ? host : `https://${host}`;
  }

  return DEFAULT_SITE_URL;
}

export const siteConfig = {
  name: profileSeed.fullName,
  title: `${profileSeed.fullName} | ${profileSeed.professionalTitle}`,
  description: profileSeed.heroDescription,
  email: profileSeed.email,
  locale: "en_US",
} as const;
