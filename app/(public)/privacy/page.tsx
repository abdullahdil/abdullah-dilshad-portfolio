import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { profileSeed } from "@/lib/content/seed";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How contact-form data is collected and used on Abdullah Dilshad’s portfolio.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <Section space="tight">
        <Container size="narrow">
          <p className="section-eyebrow">Legal</p>
          <h1 className="mt-3 font-heading text-headline-xl text-balance text-on-surface">
            Privacy
          </h1>

          <div className="mt-8 space-y-6 border-t border-outline-variant pt-8 text-pretty text-body-md text-on-surface-variant">
            <p>
              This portfolio is operated by {profileSeed.fullName}. It may collect
              contact-form submissions so inquiries can be answered. Fields can
              include name, work email, company, opportunity type, and message.
            </p>
            <p>
              Submissions are stored in a private database and are visible only to
              authorized admin access. They are not sold, rented, or shared with
              advertisers. An optional automation webhook may forward a copy of a
              submission for notification purposes when configured by the site
              operator.
            </p>
            <p>
              The site uses essential cookies or session storage only as needed for
              authenticated admin access. Public browsing does not require an
              account.
            </p>
          </div>

          <div className="mt-10 border-t border-outline-variant pt-6">
            <p className="font-label text-on-surface-faint">
              Questions or deletion requests
            </p>
            <p className="mt-2 text-body-md">
              <a
                href={`mailto:${profileSeed.email}`}
                className="link-underline text-on-surface"
              >
                {profileSeed.email}
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
