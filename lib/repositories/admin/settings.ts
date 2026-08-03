import type { SiteSettingRow } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SiteSettingsInput } from "@/lib/validations/settings";

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

async function getSetting(key: string): Promise<SiteSettingRow | null> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("setting_key", key)
    .maybeSingle();
  if (error) throw error;
  return (data as SiteSettingRow | null) ?? null;
}

export async function getAdminSiteSettings(): Promise<SiteSettingsInput> {
  const [availability, responseTime, footer] = await Promise.all([
    getSetting("availability"),
    getSetting("response_time"),
    getSetting("footer_note"),
  ]);

  const availabilityValue =
    availability?.setting_value && typeof availability.setting_value === "object"
      ? (availability.setting_value as Record<string, unknown>)
      : {};

  return {
    availabilityStatus:
      availabilityValue.status === "limited" ||
      availabilityValue.status === "unavailable"
        ? availabilityValue.status
        : "available",
    availabilityLabel:
      typeof availabilityValue.label === "string" && availabilityValue.label
        ? availabilityValue.label
        : "Available for Remote Work",
    responseTimeNote:
      typeof responseTime?.setting_value === "string"
        ? responseTime.setting_value
        : typeof responseTime?.setting_value === "object" &&
            responseTime.setting_value &&
            "note" in responseTime.setting_value &&
            typeof (responseTime.setting_value as { note?: unknown }).note === "string"
          ? ((responseTime.setting_value as { note: string }).note ?? "")
          : "",
    footerNote:
      typeof footer?.setting_value === "string"
        ? footer.setting_value
        : typeof footer?.setting_value === "object" &&
            footer.setting_value &&
            "note" in footer.setting_value &&
            typeof (footer.setting_value as { note?: unknown }).note === "string"
          ? ((footer.setting_value as { note: string }).note ?? "")
          : "",
  };
}

export async function upsertAdminSiteSettings(input: SiteSettingsInput): Promise<void> {
  const supabase = await requireClient();

  const writes: Array<{ setting_key: string; setting_value: Record<string, string> }> = [
    {
      setting_key: "availability",
      setting_value: {
        status: input.availabilityStatus,
        label: input.availabilityLabel,
      },
    },
    {
      setting_key: "response_time",
      setting_value: { note: input.responseTimeNote },
    },
    {
      setting_key: "footer_note",
      setting_value: { note: input.footerNote },
    },
  ];

  for (const row of writes) {
    const { error } = await supabase
      .from("site_settings")
      .upsert(row, { onConflict: "setting_key" });
    if (error) throw error;
  }
}
