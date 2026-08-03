import { AboutSection } from "@/components/public/about-section";
import { CapabilitiesSection } from "@/components/public/capabilities-section";
import { CaseStudiesSection } from "@/components/public/case-studies-section";
import { ContactSection } from "@/components/public/contact-section";
import { ExperienceSection } from "@/components/public/experience-section";
import { HeroSection } from "@/components/public/hero-section";
import { TemplatesSection } from "@/components/public/templates-section";

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <CaseStudiesSection />
      <ExperienceSection />
      <CapabilitiesSection />
      <TemplatesSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
