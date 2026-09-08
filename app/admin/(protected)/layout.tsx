import { AdminShell } from "@/components/admin/admin-shell";
import { DbHealthBanner } from "@/components/admin/db-health-banner";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import { checkDatabaseHealth } from "@/lib/repositories/db-health";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuthorizedAdmin();
  const health = await checkDatabaseHealth();

  return (
    <AdminShell
      title="Command Center"
      description={session.email ? `Signed in as ${session.email}` : "Authorized session"}
      userEmail={session.email}
    >
      <DbHealthBanner health={health} />
      {children}
    </AdminShell>
  );
}
