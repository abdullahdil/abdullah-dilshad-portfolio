import Link from "next/link";
import { Container } from "@/components/ui/container";
import { profileSeed } from "@/lib/content/seed";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-outline-variant bg-surface">
      <Container className="flex flex-col items-start justify-between gap-8 py-12 md:flex-row md:items-center">
        <div>
          <p className="font-heading text-base font-semibold text-on-surface">
            {profileSeed.fullName}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            © {year} {profileSeed.fullName}
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <Link
            href={profileSeed.linkedinUrl}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
          <Link
            href={profileSeed.n8nProfileUrl}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
            target="_blank"
            rel="noopener noreferrer"
          >
            n8n
          </Link>
          <Link
            href="/privacy"
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Privacy
          </Link>
          <Link
            href={`mailto:${profileSeed.email}`}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            {profileSeed.email}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
