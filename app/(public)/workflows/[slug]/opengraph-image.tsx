import { ImageResponse } from "next/og";
import { getPublishedWorkflowBySlug } from "@/lib/repositories/site-content";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/seo/og-card";
import { siteConfig } from "@/lib/site";

export const alt = `Automation workflow by ${siteConfig.name}, ${siteConfig.role}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workflow = await getPublishedWorkflowBySlug(slug);

  return new ImageResponse(
    (
      <OgCard
        eyebrow={workflow ? `Workflow · ${workflow.category}` : "Workflow"}
        title={workflow?.title ?? siteConfig.title}
        subtitle={workflow?.summary ?? siteConfig.seoDescription}
      />
    ),
    { ...size },
  );
}
