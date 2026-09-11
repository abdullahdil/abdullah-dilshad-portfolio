import { AboutSection } from "@/components/public/about-section";
import { AskDemoSection } from "@/components/public/ask-demo";
import { CapabilitiesSection } from "@/components/public/capabilities-section";
import { CaseStudiesSection } from "@/components/public/case-studies-section";
import { ContactSection } from "@/components/public/contact-section";
import { ExperienceSection } from "@/components/public/experience-section";
import { HeroSection } from "@/components/public/hero-section";
import { TemplatesSection } from "@/components/public/templates-section";
import { WorkflowsSection } from "@/components/public/workflows-section";
import { getDemoStatus } from "@/lib/demo/status";
import { listPublishedWorkflowGroups } from "@/lib/repositories/site-content";

export default async function HomePage() {
  const workflowGroups = await listPublishedWorkflowGroups();
  // Server-side only: the demo status carries no key, URL or secret.
  const demoStatus = getDemoStatus();

  return (
    <main id="main-content">
      <HeroSection />
      <CaseStudiesSection />
      <AskDemoSection status={demoStatus} />
      <WorkflowsSection groups={workflowGroups} />
      <ExperienceSection />
      <CapabilitiesSection />
      <TemplatesSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
