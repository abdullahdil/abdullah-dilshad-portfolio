import { FeaturedWorkflows } from "@/components/catalog/featured-workflows";
import { AboutSection } from "@/components/public/about-section";
import { CaseStudiesSection } from "@/components/public/case-studies-section";
import { ContactSection } from "@/components/public/contact-section";
import { ExperienceSection } from "@/components/public/experience-section";
import { HeroSection } from "@/components/public/hero-section";
import { ReliabilitySection } from "@/components/public/reliability-section";
import { TemplatesSection } from "@/components/public/templates-section";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { JsonLd } from "@/components/seo/json-ld-script";
import { listPublishedCapabilities } from "@/lib/repositories/capabilities";
import { getPublishedCaseStudyCards } from "@/lib/repositories/case-studies";
import { listPublishedExperience } from "@/lib/repositories/experience";
import { getPublicProfile } from "@/lib/repositories/profile";
import {
  listPublishedProofPoints,
  listPublishedWorkflowListings,
} from "@/lib/repositories/site-content";
import { listPublishedTemplates } from "@/lib/repositories/templates";
import { homeMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, profilePageJsonLd } from "@/lib/seo/json-ld";

export const metadata = homeMetadata;
export const revalidate = 3600;

/**
 * Home IA — who, what, proof, next step, in that order:
 * hero (+ proof band) → selected work → featured systems → how I build →
 * experience & capabilities → templates → about → contact.
 */
export default async function HomePage() {
  const [
    profile,
    caseStudies,
    workflowListings,
    templates,
    proofPoints,
    experience,
    capabilities,
  ] = await Promise.all([
    getPublicProfile(),
    getPublishedCaseStudyCards(),
    listPublishedWorkflowListings(),
    listPublishedTemplates(),
    listPublishedProofPoints(),
    listPublishedExperience(),
    listPublishedCapabilities(),
  ]);

  return (
    <main id="main-content">
      <JsonLd
        data={[
          profilePageJsonLd(profile),
          itemListJsonLd(
            caseStudies.map((study) => ({
              name: study.title,
              path: `/work/${study.slug}`,
            })),
          ),
        ]}
      />

      <HeroSection
        profile={profile}
        systemCount={workflowListings.length}
        templateCount={templates.length}
        featuredProof={proofPoints.filter((point) => point.featured)}
      />
      <CaseStudiesSection cards={caseStudies} />
      <Section
        id="systems"
        tone="low"
        className="section-veil"
        aria-labelledby="systems-title"
      >
        <Container>
          <SectionHeading
            eyebrow="Systems"
            title="Systems that replace manual work"
            titleId="systems-title"
            description="Production automations that cut handoffs, reduce follow-up, and keep teams focused on decisions instead of busywork."
            className="mb-12"
          />
          <FeaturedWorkflows listings={workflowListings} />
        </Container>
      </Section>
      <ReliabilitySection />
      <ExperienceSection experience={experience} capabilities={capabilities} />
      <TemplatesSection
        templates={templates}
        n8nProfileUrl={profile.n8nProfileUrl}
      />
      <AboutSection profile={profile} />
      <ContactSection />
    </main>
  );
}
