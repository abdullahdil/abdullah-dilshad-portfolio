import Link from "next/link";
import { redirect } from "next/navigation";
import { Terminal } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getAuthorizedAdminSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Admin Login",
};

const errorMessages: Record<string, string> = {
  not_configured:
    "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, apply migrations, and authorize your Auth user in authorized_admins.",
  unauthorized:
    "This account is signed in but is not listed in authorized_admins. Contact the site operator.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const configured = isSupabaseConfigured();
  const session = configured ? await getAuthorizedAdminSession() : null;
  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const bannerError =
    params.error && errorMessages[params.error]
      ? errorMessages[params.error]
      : params.error
        ? "Authentication required."
        : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-gutter">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container">
            <Terminal className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <h1 className="font-heading text-headline-md tracking-tighter text-on-surface">
            Abdullah<span className="text-primary">.</span>
          </h1>
          <p className="mt-2 font-label uppercase tracking-widest text-outline">
            Command Center // Authorized access only
          </p>
        </div>

        <div className="glass-panel relative overflow-hidden rounded-lg p-8">
          <div className="space-y-6">
            <div>
              <h2 className="font-heading font-semibold text-on-surface">
                System Authorization
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Email/password via Supabase Auth. No public registration.
              </p>
            </div>

            <LoginForm configured={configured} bannerError={bannerError} />

            <p className="border-t border-outline-variant/10 pt-4 text-xs text-on-surface-variant">
              Authorized personnel only. See docs/SUPABASE.md for admin setup.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          <Link href="/" className="text-primary hover:underline">
            Return to public site
          </Link>
        </p>
      </div>
    </main>
  );
}
