/**
 * schema.org builders. Every builder returns a plain, serialisable object
 * with its own "@context"; render through components/seo/json-ld-script.tsx
 * (which escapes "<"). Structured data must describe text that is visible on
 * the page it is rendered on — never add claims here that the page omits.
 */
import type { CaseStudy } from "@/lib/content/types";
import type { PublicProfile } from "@/lib/repositories/profile";
import type { PublicWorkflowListing } from "@/lib/repositories/site-content";
import { getSiteUrl, siteConfig } from "@/lib/site";

const CONTEXT = "https://schema.org";

/**
 * Serialise structured data for a <script type="application/ld+json">.
 * JSON.stringify does not stop "</script>" breaking out of the tag, so
 * "<", ">" and "&" are written as unicode escapes (still valid JSON), as are
 * U+2028/U+2029. JSON-LD is data, not executable script, so the strict CSP
 * does not apply to it.
 */
export function serializeJsonLd(data: object | object[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Absolute URL for a site path (or pass-through for an absolute URL). */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const site = getSiteUrl();
  if (!pathOrUrl || pathOrUrl === "/") return site;
  return `${site}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function personId(): string {
  return `${getSiteUrl()}/#person`;
}

export function websiteId(): string {
  return `${getSiteUrl()}/#website`;
}

/** Public portrait used when the CMS has none uploaded. */
export const DEFAULT_PORTRAIT_PATH = "/images/hero-portrait-v2.jpg";

/**
 * Ordered so the breadth leads; n8n is one tool among several, last
 * (CONTENT_TRUTH.md → Positioning rules).
 */
export const PERSON_KNOWS_ABOUT = [
  "AI automation",
  "LLM orchestration",
  "API integration",
  "Business process automation",
  "Workflow automation",
  "Human-in-the-loop approval",
  "Python",
  "JavaScript",
  "n8n",
] as const;

function compact<T>(values: (T | null | undefined | "")[]): T[] {
  return values.filter((v): v is T => v !== null && v !== undefined && v !== "");
}

function personReference() {
  return {
    "@type": "Person",
    "@id": personId(),
    name: siteConfig.name,
    url: absoluteUrl("/"),
  };
}

function parseLocation(location: string) {
  const [locality, ...rest] = location.split(",").map((part) => part.trim());
  return compact([
    locality ? ["addressLocality", locality] : null,
    rest.length ? ["addressCountry", rest.join(", ")] : null,
  ]);
}

/** Home: WebSite + ProfilePage whose mainEntity is the Person (from the CMS profile). */
export function profilePageJsonLd(profile: PublicProfile) {
  const site = getSiteUrl();
  const addressParts = parseLocation(profile.location);

  const person = {
    "@type": "Person",
    "@id": personId(),
    name: profile.fullName,
    url: site,
    jobTitle: siteConfig.role,
    description: profile.shortBio,
    image: absoluteUrl(profile.portraitUrl || DEFAULT_PORTRAIT_PATH),
    email: `mailto:${profile.email}`,
    ...(addressParts.length
      ? {
          address: {
            "@type": "PostalAddress",
            ...Object.fromEntries(addressParts),
          },
        }
      : {}),
    worksFor: { "@type": "Organization", name: "AiMark Labs" },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "FAST National University of Computer and Emerging Sciences (FAST-NUCES)",
    },
    knowsAbout: [...PERSON_KNOWS_ABOUT],
    ...(profile.credentialUrl
      ? {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            name: "n8n Course Level 2",
            credentialCategory: "certificate",
            url: profile.credentialUrl,
          },
        }
      : {}),
    sameAs: compact([
      profile.linkedinUrl,
      profile.xUrl,
      profile.githubUrl,
      profile.instagramUrl,
      profile.n8nProfileUrl,
    ]),
  };

  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId(),
        url: site,
        name: profile.fullName,
        description: siteConfig.seoDescription,
        inLanguage: "en",
        publisher: { "@id": personId() },
      },
      {
        "@type": "ProfilePage",
        "@id": `${site}/#profilepage`,
        url: site,
        name: `${profile.fullName} | ${siteConfig.role}`,
        isPartOf: { "@id": websiteId() },
        mainEntity: { "@id": personId() },
        inLanguage: "en",
      },
      person,
    ],
  };
}

/** Case study page: Article authored by the Person. */
export function articleJsonLd(
  study: CaseStudy & { updatedAt?: string | null },
) {
  const url = absoluteUrl(`/work/${study.slug}`);
  const updatedAt = study.updatedAt ?? null;

  return {
    "@context": CONTEXT,
    "@type": "Article",
    "@id": `${url}#article`,
    headline: study.title.slice(0, 110),
    description: study.summary,
    url,
    mainEntityOfPage: url,
    image: [absoluteUrl(study.featuredImageUrl || "/og-image.png")],
    author: personReference(),
    publisher: personReference(),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    ...(study.tools.length
      ? { keywords: study.tools.map((tool) => tool.name).join(", ") }
      : {}),
    isPartOf: { "@id": websiteId() },
    inLanguage: "en",
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
}) {
  const url = absoluteUrl(opts.path);
  return {
    "@context": CONTEXT,
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: opts.name,
    description: opts.description,
    url,
    isPartOf: { "@id": websiteId() },
    author: personReference(),
    inLanguage: "en",
  };
}

/** Fields of a listing the workflow builder reads (B1 adds slug/updatedAt). */
type WorkflowJsonLdInput = Pick<
  PublicWorkflowListing,
  "id" | "title" | "summary" | "category" | "outcomeTags"
> & { slug?: string; updatedAt?: string | null };

/**
 * Workflow detail page. Google has no rich result for an automation
 * workflow; CreativeWork is the honest generic type (SoftwareSourceCode
 * would imply published source, which these pages do not offer). The
 * BreadcrumbList (Home › Work › workflow) is included in the same graph, so
 * the page needs no separate breadcrumb builder call.
 */
export function workflowJsonLd(listing: WorkflowJsonLdInput) {
  const slug = listing.slug || listing.id;
  const path = `/workflows/${slug}`;
  const url = absoluteUrl(path);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: listing.title, path },
  ]);

  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#workflow`,
        name: listing.title,
        description: listing.summary,
        url,
        genre: listing.category,
        ...(listing.outcomeTags.length
          ? { keywords: listing.outcomeTags.join(", ") }
          : {}),
        ...(listing.updatedAt ? { dateModified: listing.updatedAt } : {}),
        author: personReference(),
        isPartOf: { "@id": `${absoluteUrl("/work")}#collection` },
        inLanguage: "en",
      },
      { "@type": breadcrumb["@type"], itemListElement: breadcrumb.itemListElement },
    ],
  };
}
