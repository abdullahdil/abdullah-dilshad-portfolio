import { Clock, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublicProfile } from "@/lib/repositories/profile";

export async function ContactSection() {
  const profile = await getPublicProfile();

  return (
    <Section id="contact">
      <Container>
        <div className="grid grid-cols-1 gap-12 rounded-lg border border-outline-variant lg:grid-cols-2 lg:gap-0">
          <div className="p-8 md:p-12 lg:border-r lg:border-outline-variant">
            <p className="section-eyebrow mb-3">Contact</p>
            <h2 className="font-heading text-headline-lg text-on-surface">
              Have a workflow that should not still be manual?
            </h2>
            <p className="mt-4 text-body-md text-on-surface-variant">
              I&apos;m open to international remote roles, long-term contracts, and
              selected automation projects.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-3 text-sm text-on-surface hover:text-accent"
              >
                <Mail className="h-4 w-4 shrink-0 text-on-surface-variant" aria-hidden />
                {profile.email}
              </a>
              <div className="flex items-center gap-3 text-sm text-on-surface">
                <MapPin className="h-4 w-4 shrink-0 text-on-surface-variant" aria-hidden />
                {profile.location} / Remote
              </div>
              <div className="flex items-center gap-3 text-sm text-on-surface">
                <Clock className="h-4 w-4 shrink-0 text-on-surface-variant" aria-hidden />
                PKT (GMT+5) · overlaps 9am–2pm CET and 8am–11am ET
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <ContactForm contactEmail={profile.email} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
