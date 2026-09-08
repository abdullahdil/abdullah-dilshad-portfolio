import { NavLinkManager } from "@/components/admin/nav-link-manager";
import { listAdminNavLinks } from "@/lib/repositories/admin/site-content";

export const metadata = { title: "Navigation" };

export default async function AdminNavigationPage() {
  const items = await listAdminNavLinks();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Navigation</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Links in the site header and footer, in display order.
        </p>
      </div>
      <NavLinkManager items={items} />
    </div>
  );
}
