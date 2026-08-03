import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  const url = new URL("/admin/login", request.url);
  const nextError = new URL(request.url).searchParams.get("error");
  if (nextError) {
    url.searchParams.set("error", nextError);
  }

  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: Request) {
  return POST(request);
}
