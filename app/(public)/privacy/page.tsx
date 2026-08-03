import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
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
    <main id="main-content" className="pb-16 pt-28">
      <Container className="max-w-3xl space-y-6">
        <h1 className="font-heading text-headline-lg text-on-surface">Privacy</h1>
        <p className="text-body-md text-on-surface-variant">
          This portfolio is operated by {profileSeed.fullName}. It may collect
          contact-form submissions so inquiries can be answered. Fields can
          include name, work email, company, opportunity type, and message.
        </p>
        <p className="text-body-md text-on-surface-variant">
          Submissions are stored in a private database and are visible only to
          authorized admin access. They are not sold, rented, or shared with
          advertisers. An optional automation webhook may forward a copy of a
          submission for notification purposes when configured by the site
          operator.
        </p>
        <p className="text-body-md text-on-surface-variant">
          The site uses essential cookies or session storage only as needed for
          authenticated admin access. Public browsing does not require an
          account.
        </p>
        <p className="text-body-md text-on-surface-variant">
          Questions or deletion requests:{" "}
          <a
            href={`mailto:${profileSeed.email}`}
            className="text-primary hover:underline"
          >
            {profileSeed.email}
          </a>
          .
        </p>
      </Container>
    </main>
  );
}
