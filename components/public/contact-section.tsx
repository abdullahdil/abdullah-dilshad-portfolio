import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublicProfile } from "@/lib/repositories/profile";

export async function ContactSection() {
  const profile = await getPublicProfile();

  return (
    <Section id="contact">
      <Container>
        <div className="overflow-hidden rounded-lg border border-outline-variant/10 bg-surface-low grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-8 bg-surface-lowest p-8 md:p-12">
            <h2 className="font-heading text-headline-lg text-on-surface">
              Have a workflow that should not still be manual?
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              Stop losing hours to repetitive tasks. Let&apos;s engineer a solution
              that works while you sleep. Open to international remote roles,
              long-term contracts, and selected automation projects.
            </p>
            <div className="space-y-4">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant text-primary">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-label text-on-surface">{profile.email}</span>
              </a>
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant text-primary">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-label text-on-surface">
                  {profile.location} / Remote
                </span>
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
