import type { MetadataRoute } from "next";
import { listPublishedCaseStudies } from "@/lib/repositories/case-studies";
import { listPublishedWorkflowListings } from "@/lib/repositories/site-content";
import { getSiteUrl } from "@/lib/site";

/** Rebuilt hourly; admin saves don't need to touch it. */
export const revalidate = 3600;

function toDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function latest(dates: (Date | undefined)[]): Date | undefined {
  const times = dates.filter((d): d is Date => Boolean(d)).map((d) => d.getTime());
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [studies, workflows] = await Promise.all([
    listPublishedCaseStudies(),
    listPublishedWorkflowListings(),
  ]);

  const studyEntries: MetadataRoute.Sitemap = studies.map((study) => ({
    url: `${siteUrl}/work/${study.slug}`,
    lastModified: toDate(study.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const workflowEntries: MetadataRoute.Sitemap = workflows.map((workflow) => ({
    url: `${siteUrl}/workflows/${workflow.slug}`,
    lastModified: toDate(workflow.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const contentModified = latest([
    ...studyEntries.map((e) => e.lastModified as Date | undefined),
    ...workflowEntries.map((e) => e.lastModified as Date | undefined),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: contentModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/work`,
      lastModified: contentModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${siteUrl}/resume`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticEntries, ...studyEntries, ...workflowEntries];
}
