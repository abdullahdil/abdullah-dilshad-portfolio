import { ImageResponse } from "next/og";
import { getPublishedCaseStudyBySlug } from "@/lib/repositories/case-studies";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/seo/og-card";
import { siteConfig } from "@/lib/site";

export const alt = `Case study by ${siteConfig.name}, ${siteConfig.role}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Case study"
        title={study?.title ?? siteConfig.title}
        subtitle={study?.summary ?? siteConfig.seoDescription}
      />
    ),
    { ...size },
  );
}
