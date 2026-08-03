import Link from "next/link";
import { Container } from "@/components/ui/container";
import { profileSeed } from "@/lib/content/seed";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-outline-variant/10 bg-background">
      <Container className="flex flex-col items-center justify-between gap-8 py-12 md:flex-row">
        <div className="space-y-2 text-center md:text-left">
          <div className="font-heading text-headline-md font-bold tracking-tighter text-on-surface">
            {profileSeed.fullName}
          </div>
          <p className="text-body-md text-on-surface-variant">
            © {year} {profileSeed.fullName}. Built with precision.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-body-md">
          <Link
            href={profileSeed.linkedinUrl}
            className="text-on-surface-variant transition-colors hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
          <Link
            href={profileSeed.n8nProfileUrl}
            className="text-on-surface-variant transition-colors hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            n8n Cloud
          </Link>
          <Link
            href="/privacy"
            className="text-on-surface-variant transition-colors hover:text-primary"
          >
            Privacy
          </Link>
          <Link
            href={`mailto:${profileSeed.email}`}
            className="text-on-surface-variant transition-colors hover:text-primary"
          >
            Email
          </Link>
        </div>

        <div className="flex items-center gap-2 font-label text-xs uppercase text-on-surface-variant">
          Status:
          <span className="flex items-center gap-2 text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden />
            All systems operational
          </span>
        </div>
      </Container>
    </footer>
  );
}
