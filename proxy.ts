import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminRoute =
    pathname === "/admin/login" || pathname.startsWith("/admin/logout");

  const { response, configured, userId } = await updateSession(request);

  if (!isAdminRoute || isPublicAdminRoute) {
    return response;
  }

  // Protected admin routes (everything under /admin except /admin/login)
  if (!configured) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "not_configured");
    return NextResponse.redirect(url);
  }

  if (!userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Refresh auth cookies site-wide; gate /admin/* (except login) when unauthenticated.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
