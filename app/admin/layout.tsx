import type { Metadata } from "next";

/** The CMS must never be indexed — covers login and every protected page. */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
