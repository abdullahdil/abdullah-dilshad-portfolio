import type {
  ContactStatus,
  ContactSubmissionRow,
} from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function listAdminMessages(): Promise<ContactSubmissionRow[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContactSubmissionRow[];
}

export async function countUnreadMessages(): Promise<number> {
  const supabase = await requireClient();
  const { count, error } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "unread");
  if (error) throw error;
  return count ?? 0;
}

export async function updateMessageStatus(
  id: string,
  status: ContactStatus,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
