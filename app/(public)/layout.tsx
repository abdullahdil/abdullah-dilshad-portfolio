import { normalizeNavLinks } from "@/components/public/nav-links";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getPublicProfile } from "@/lib/repositories/profile";
import { listPublishedNavLinks } from "@/lib/repositories/site-content";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [links, profile] = await Promise.all([
    listPublishedNavLinks(),
    getPublicProfile(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-on-surface">
      <SiteHeader
        links={normalizeNavLinks(links)}
        fullName={profile.fullName}
        availabilityLabel={profile.availabilityLabel}
        cvUrl={profile.cvUrl ?? "/resume"}
        linkedinUrl={profile.linkedinUrl}
        instagramUrl={profile.instagramUrl}
        xUrl={profile.xUrl}
      />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
