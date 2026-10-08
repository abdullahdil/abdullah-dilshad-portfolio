import { afterAll, describe, expect, it } from "vitest";
import { caseStudies } from "@/lib/content/case-studies";
import { profileSeed } from "@/lib/content/seed";
import type { PublicProfile } from "@/lib/repositories/profile";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
  PERSON_KNOWS_ABOUT,
  profilePageJsonLd,
  serializeJsonLd,
  workflowJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata, homeMetadata } from "@/lib/seo/metadata";
import { getSiteUrl, siteConfig } from "@/lib/site";

const SITE = "https://abdullah.example";

const profile: PublicProfile = {
  fullName: profileSeed.fullName,
  professionalTitle: profileSeed.professionalTitle,
  heroHeadline: profileSeed.heroHeadline,
  heroDescription: profileSeed.heroDescription,
  shortBio: profileSeed.shortBio,
  longBio: [...profileSeed.longBio],
  location: "Islamabad, Pakistan",
  availabilityStatus: "available",
  availabilityLabel: "Available",
  email: profileSeed.email,
  linkedinUrl: profileSeed.linkedinUrl,
  instagramUrl: profileSeed.instagramUrl,
  xUrl: profileSeed.xUrl,
  githubUrl: null,
  n8nProfileUrl: profileSeed.n8nProfileUrl,
  credentialUrl: profileSeed.credentialUrl,
  cvUrl: profileSeed.cvUrl,
  portraitUrl: null,
};

type Node = Record<string, unknown>;
const graphOf = (data: { "@graph": unknown[] }) => data["@graph"] as Node[];

// Set at module scope: several builders run while describe blocks are collected.
const previousSite = process.env.NEXT_PUBLIC_SITE_URL;
process.env.NEXT_PUBLIC_SITE_URL = SITE;
afterAll(() => {
  if (previousSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = previousSite;
});

describe("getSiteUrl", () => {
  it("prefers the stable Vercel production domain over per-deploy hosts", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const prev = { prod: process.env.VERCEL_PROJECT_PRODUCTION_URL, url: process.env.VERCEL_URL };
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "abdullah.example";
    process.env.VERCEL_URL = "portfolio-abc123.vercel.app";
    expect(getSiteUrl()).toBe("https://abdullah.example");
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");
    if (prev.prod !== undefined) process.env.VERCEL_PROJECT_PRODUCTION_URL = prev.prod;
    if (prev.url === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = prev.url;
    process.env.NEXT_PUBLIC_SITE_URL = SITE;
  });
});

describe("siteConfig identity", () => {
  it("keeps the meta description snippet-sized and n8n-free", () => {
    expect(siteConfig.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(siteConfig.seoDescription.length).toBeLessThanOrEqual(160);
    for (const text of [siteConfig.title, siteConfig.seoDescription, siteConfig.identity]) {
      expect(text.toLowerCase()).not.toContain("n8n");
      expect(text.toLowerCase()).not.toMatch(/no-code|low-code/);
    }
  });
});

describe("serializeJsonLd", () => {
  it("cannot break out of the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script> & co" });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script> & co");
  });
});

describe("profilePageJsonLd", () => {
  const data = profilePageJsonLd(profile);
  const nodes = graphOf(data);
  const person = nodes.find((n) => n["@type"] === "Person")!;
  const page = nodes.find((n) => n["@type"] === "ProfilePage")!;

  it("links ProfilePage.mainEntity to the Person by @id", () => {
    expect(data["@context"]).toBe("https://schema.org");
    expect(person["@id"]).toBe(`${SITE}/#person`);
    expect(page.mainEntity).toEqual({ "@id": `${SITE}/#person` });
  });

  it("uses CMS profile fields, an absolute portrait and real social profiles", () => {
    expect(person.name).toBe(profile.fullName);
    expect(person.image).toBe(`${SITE}/images/hero-portrait-v2.jpg`);
    expect(person.sameAs).toEqual(
      expect.arrayContaining([profile.linkedinUrl, profile.xUrl, profile.n8nProfileUrl]),
    );
    expect(person.sameAs).not.toContain(null);
    expect(person.address).toMatchObject({ addressLocality: "Islamabad", addressCountry: "Pakistan" });
  });

  it("never leads with n8n", () => {
    expect(PERSON_KNOWS_ABOUT[0]).toBe("AI automation");
    expect((person.knowsAbout as string[]).slice(0, 3).join(" ").toLowerCase()).not.toContain("n8n");
    expect(String(person.jobTitle).toLowerCase()).not.toContain("n8n");
  });
});

describe("articleJsonLd", () => {
  const study = { ...caseStudies[0], updatedAt: "2026-09-01T00:00:00Z" };
  const article = articleJsonLd(study);

  it("has required Article fields and an author linked to the Person", () => {
    expect(article["@type"]).toBe("Article");
    expect(article.headline).toBe(study.title.slice(0, 110));
    expect(article.url).toBe(`${SITE}/work/${study.slug}`);
    expect(article.author).toMatchObject({ "@type": "Person", "@id": `${SITE}/#person` });
    expect(article.dateModified).toBe("2026-09-01T00:00:00Z");
    expect(article.image[0]).toMatch(/^https:\/\//);
  });

  it("omits dateModified when unknown", () => {
    expect(articleJsonLd({ ...caseStudies[0], updatedAt: null })).not.toHaveProperty("dateModified");
  });
});

describe("list builders", () => {
  it("numbers breadcrumbs and item lists from 1 with absolute URLs", () => {
    const crumbs = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Work", path: "/work" },
    ]);
    expect(crumbs.itemListElement[0]).toMatchObject({ position: 1, item: SITE });
    expect(crumbs.itemListElement[1]).toMatchObject({ position: 2, item: `${SITE}/work` });

    const list = itemListJsonLd([{ name: "A", path: "/workflows/a" }]);
    expect(list.numberOfItems).toBe(1);
    expect(list.itemListElement[0].url).toBe(`${SITE}/workflows/a`);

    const page = collectionPageJsonLd({ name: "Work", description: "d", path: "/work" });
    expect(page).toMatchObject({ "@type": "CollectionPage", url: `${SITE}/work` });
  });

  it("workflowJsonLd describes the workflow and its breadcrumb", () => {
    const data = workflowJsonLd({
      id: "lead-intake",
      slug: "lead-intake",
      title: "Lead intake",
      summary: "Routes leads.",
      category: "Lead generation",
      outcomeTags: ["Speed"],
      updatedAt: null,
    });
    const [work, crumbs] = graphOf(data);
    expect(work).toMatchObject({ "@type": "CreativeWork", url: `${SITE}/workflows/lead-intake` });
    expect(work).not.toHaveProperty("dateModified");
    expect(crumbs["@type"]).toBe("BreadcrumbList");
  });
});

describe("buildPageMetadata", () => {
  it("sets canonical, og:url and keeps siteName/locale on every page", () => {
    const meta = buildPageMetadata({ title: "Resume", description: "d", path: "/resume/" });
    expect(meta.alternates?.canonical).toBe("/resume");
    expect(meta.openGraph).toMatchObject({
      url: "/resume",
      siteName: siteConfig.name,
      locale: "en_US",
      title: `Resume | ${siteConfig.name}`,
    });
    expect(meta.openGraph?.images).toEqual([expect.objectContaining({ width: 1200, height: 630 })]);
    expect(meta.twitter).toMatchObject({ creator: "@Abdullahdilsha7" });
    expect(meta.robots).toBeUndefined();
  });

  it("leaves images to a file-based opengraph-image when image is null", () => {
    const meta = buildPageMetadata({ title: "T", description: "d", path: "/work/x", type: "article", image: null });
    expect(meta.openGraph).not.toHaveProperty("images");
    expect(meta.openGraph).toMatchObject({ type: "article" });
  });

  it("supports noindex", () => {
    const meta = buildPageMetadata({ title: "T", description: "d", path: "/x", noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("home metadata is canonical / with an absolute title", () => {
    expect(homeMetadata.alternates?.canonical).toBe("/");
    expect(homeMetadata.title).toEqual({ absolute: siteConfig.title });
  });
});
