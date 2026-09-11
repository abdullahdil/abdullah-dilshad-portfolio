import { Clock, ExternalLink, Mail, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { getPublicProfile } from "@/lib/repositories/profile";

type Channel = {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

export async function ContactSection() {
  const profile = await getPublicProfile();

  const channels: Channel[] = [
    {
      key: "email",
      icon: Mail,
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
  ];

  if (profile.linkedinUrl) {
    channels.push({
      key: "linkedin",
      icon: ExternalLink,
      label: "LinkedIn",
      value: "abdullah-dilshad",
      href: profile.linkedinUrl,
    });
  }

  channels.push(
    {
      key: "location",
      icon: MapPin,
      label: "Based in",
      value: `${profile.location} / Remote`,
    },
    {
      key: "hours",
      icon: Clock,
      label: "Overlap",
      value: "PKT (GMT+5) · overlaps 9am–2pm CET and 8am–11am ET",
    },
  );

  return (
    <Section id="contact" divider>
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: the pitch and the direct routes. */}
          <div className="lg:col-span-5">
            <p className="section-eyebrow mb-3">Contact</p>
            <h2 className="font-heading text-headline-xl text-balance text-on-surface">
              Have a workflow that should not still be manual?
            </h2>
            <p className="mt-4 max-w-[60ch] text-body-md text-pretty text-on-surface-variant">
              I&apos;m open to international remote roles, long-term contracts, and
              selected automation projects.
            </p>

            {profile.availabilityLabel ? (
              <StatusIndicator
                label={profile.availabilityLabel}
                pulse={profile.availabilityStatus === "available"}
                className="mt-6"
              />
            ) : null}

            <dl className="mt-10 border-t border-outline-variant">
              {channels.map(({ key, icon: Icon, label, value, href }) => (
                <div
                  key={key}
                  className="flex flex-col gap-1 border-b border-outline-variant py-4 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <dt className="font-label flex shrink-0 items-center gap-2 text-on-surface-faint sm:w-24">
                    <Icon
                      className="h-3.5 w-3.5 shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                    {label}
                  </dt>
                  <dd className="min-w-0 text-body-sm break-words text-on-surface">
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={
                          href.startsWith("mailto:")
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className="link-underline text-on-surface hover:text-accent"
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: the form. */}
          <div className="lg:col-span-7">
            <ContactForm contactEmail={profile.email} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
