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
    <div className="flex min-h-full flex-col">
      <SiteHeader
        links={links}
        fullName={profile.fullName}
        availabilityLabel={profile.availabilityLabel}
        cvUrl={profile.cvUrl ?? "/resume"}
      />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
