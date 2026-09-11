import Link from "next/link";
import { Container } from "@/components/ui/container";
import { profileSeed } from "@/lib/content/seed";

const linkClass =
  "link-underline text-body-sm text-on-surface-variant transition-colors hover:text-on-surface";

export function SiteFooter() {
  const year = new Date().getFullYear();

  // `.page-end-wash` sits on the footer rather than on one page's last section:
  // the footer is the end of the document on every route, so the page resolves
  // the same way on the homepage, the resume and a case study.
  return (
    <footer className="page-end-wash border-t border-outline-variant bg-surface">
      <Container className="py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="font-heading text-headline-sm tracking-[-0.02em] text-on-surface">
              {profileSeed.fullName}
            </p>
            <p className="mt-2 max-w-[36ch] text-pretty text-body-sm text-on-surface-variant">
              {profileSeed.professionalTitle}
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="font-label text-on-surface-faint">Elsewhere</p>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={profileSeed.linkedinUrl}
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link
                  href={profileSeed.n8nProfileUrl}
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  n8n
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="font-label text-on-surface-faint">Contact</p>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href={`mailto:${profileSeed.email}`} className={linkClass}>
                  {profileSeed.email}
                </Link>
              </li>
              <li className="text-body-sm text-on-surface-faint">
                {profileSeed.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-outline-variant pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-label text-on-surface-faint">
            © {year} {profileSeed.fullName}
          </p>
          <nav aria-label="Legal" className="flex items-center gap-6">
            <Link href="/privacy" className={linkClass}>
              Privacy
            </Link>
            <Link href="/resume" className={linkClass}>
              Resume
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
