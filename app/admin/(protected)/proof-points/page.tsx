import { ProofPointManager } from "@/components/admin/proof-point-manager";
import { listAdminProofPoints } from "@/lib/repositories/admin/site-content";

export const metadata = { title: "Proof Strip" };

export default async function AdminProofPointsPage() {
  const items = await listAdminProofPoints();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Proof Strip</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          The credibility row directly under the hero headline.
        </p>
      </div>
      <ProofPointManager items={items} />
    </div>
  );
}
