import { ProfileForm } from "@/components/admin/profile-form";
import { getAdminProfile } from "@/lib/repositories/admin/profile";

export const metadata = { title: "Profile" };

export default async function AdminProfilePage() {
  const profile = await getAdminProfile();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Profile</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Hero, bio, availability, and social links shown on the public site.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
