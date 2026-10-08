import type { PublicNavLink } from "@/lib/repositories/site-content";

/**
 * Legacy CMS nav rows pointed at home-page anchors. Since the `/work` hub
 * exists, "Work" and "Workflows" resolve there instead, and "Capabilities" is
 * folded into the Experience band on home. Any other admin-entered link passes
 * through untouched, so the navigation table stays the source of truth.
 */
const LEGACY_REWRITES: Record<string, PublicNavLink | null> = {
  "/#work": { href: "/work", label: "Work" },
  "/#workflows": { href: "/work#catalog", label: "Systems" },
  "/#capabilities": null,
};

export function normalizeNavLinks(links: PublicNavLink[]): PublicNavLink[] {
  const seen = new Set<string>();
  const result: PublicNavLink[] = [];

  for (const link of links) {
    const rewrite =
      link.href in LEGACY_REWRITES ? LEGACY_REWRITES[link.href] : link;
    if (!rewrite || seen.has(rewrite.href)) continue;
    seen.add(rewrite.href);
    result.push(rewrite);
  }

  return result;
}

/** True when `href` is the section of the site the visitor is currently in. */
export function isNavLinkActive(href: string, pathname: string): boolean {
  if (href === "/work") {
    return pathname === "/work" || pathname.startsWith("/work/");
  }
  if (href === "/work#catalog") return pathname.startsWith("/workflows/");
  if (href.includes("#")) return false;
  return pathname === href;
}
