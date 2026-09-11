import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/work/case-study-view";
import { caseStudies } from "@/lib/content/case-studies";
import {
  getPublishedAdjacentCaseStudies,
  getPublishedCaseStudyBySlug,
} from "@/lib/repositories/case-studies";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);

  if (!study) {
    return { title: "Case Study Not Found" };
  }

  const path = `/work/${study.slug}`;
  const image = study.featuredImageUrl || "/og-image.png";

  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: study.title,
      description: study.summary,
      url: path,
      images: [{ url: image, alt: study.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: study.title,
      description: study.summary,
      images: [image],
    },
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);

  if (!study) notFound();

  const { previous, next } = await getPublishedAdjacentCaseStudies(slug);

  return (
    <main id="main-content">
      <CaseStudyView study={study} previous={previous} next={next} />
    </main>
  );
}
