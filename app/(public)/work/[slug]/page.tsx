import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld-script";
import { CaseStudyView } from "@/components/work/case-study-view";
import {
  getPublishedAdjacentCaseStudies,
  getPublishedCaseStudyBySlug,
  getPublishedCaseStudyWorkflows,
  listPublishedCaseStudies,
} from "@/lib/repositories/case-studies";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

/** ISR: admin saves also call revalidatePath() for an immediate refresh. */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const studies = await listPublishedCaseStudies();
  return studies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);

  if (!study) {
    return { title: "Case Study Not Found", robots: { index: false } };
  }

  return buildPageMetadata({
    title: study.title,
    description: study.summary,
    path: `/work/${study.slug}`,
    type: "article",
    // ./opengraph-image.tsx renders the per-study card (file-based wins).
    image: null,
  });
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);

  if (!study) notFound();

  const [{ previous, next }, relatedWorkflows] = await Promise.all([
    getPublishedAdjacentCaseStudies(slug),
    getPublishedCaseStudyWorkflows(slug),
  ]);

  return (
    <main id="main-content">
      <JsonLd
        data={[
          articleJsonLd(study),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
            { name: study.title, path: `/work/${study.slug}` },
          ]),
        ]}
      />
      <CaseStudyView
        study={study}
        previous={previous}
        next={next}
        relatedWorkflows={relatedWorkflows}
      />
    </main>
  );
}
