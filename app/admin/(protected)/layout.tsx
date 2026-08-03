import { AdminShell } from "@/components/admin/admin-shell";
import { requireAuthorizedAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuthorizedAdmin();

  return (
    <AdminShell
      title="Command Center"
      description={session.email ? `Signed in as ${session.email}` : "Authorized session"}
      userEmail={session.email}
    >
      {children}
    </AdminShell>
  );
}
