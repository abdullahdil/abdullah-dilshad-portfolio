import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export type PageMetadataImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type BuildPageMetadataOptions = {
  title: string;
  description: string;
  /** Route path starting with "/" — becomes the canonical and og:url. */
  path: string;
  /**
   * Social image. Omit for the default site image (/og-image.png). Pass
   * `null` when the route segment ships its own `opengraph-image.tsx`:
   * file-based metadata wins over config, and Next falls back to the
   * og:image for twitter:image when none is set here.
   */
  image?: PageMetadataImage | null;
  type?: "website" | "article";
  noIndex?: boolean;
  /**
   * Use `title` verbatim instead of applying the root "%s | Name" template
   * (the home page already contains the name).
   */
  absoluteTitle?: boolean;
};

export const DEFAULT_OG_IMAGE: PageMetadataImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — ${siteConfig.role}`,
};

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.replace(/\/+$/, "");
}

/**
 * Complete per-page metadata. Metadata merges *shallowly* across segments,
 * so every nested object (openGraph, twitter) is rebuilt in full here —
 * a page that sets only `openGraph.title` would otherwise drop siteName,
 * locale and images inherited from the root layout.
 */
export function buildPageMetadata(opts: BuildPageMetadataOptions): Metadata {
  const path = normalizePath(opts.path);
  const image = opts.image === undefined ? DEFAULT_OG_IMAGE : opts.image;
  const socialTitle = opts.absoluteTitle
    ? opts.title
    : `${opts.title} | ${siteConfig.name}`;

  const metadata: Metadata = {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: path },
    openGraph: {
      type: opts.type ?? "website",
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: socialTitle,
      description: opts.description,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      creator: siteConfig.twitterHandle,
      title: socialTitle,
      description: opts.description,
      ...(image ? { images: [{ url: image.url, alt: image.alt }] } : {}),
    },
  };

  if (opts.noIndex) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}

/** Home page metadata — exported by app/(public)/page.tsx. */
export const homeMetadata: Metadata = buildPageMetadata({
  title: siteConfig.title,
  description: siteConfig.seoDescription,
  path: "/",
  absoluteTitle: true,
});
