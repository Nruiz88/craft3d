import "server-only";
import { supabase } from "@/lib/supabase/client";

export type SettingsKey =
  | "mp_access_token"
  | "mp_public_key"
  | "transfer_bank_name"
  | "transfer_holder"
  | "transfer_cbu"
  | "transfer_alias"
  | "transfer_note"
  | "reservation_enabled"
  | "reservation_mode"
  | "reservation_pct"
  | "reservation_fixed"
  | "reservation_note"
  | "correo_enabled"
  | "correo_customer_id"
  | "correo_user_token"
  | "correo_password_token"
  | "correo_postal_code_origin"
  | "correo_weight_grams"
  | "correo_environment"
  | "shipping_free_enabled"
  | "shipping_free_from";

export { supabase };

export async function fetchSettings(
  keys: SettingsKey[],
): Promise<Map<string, string>> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", keys);
    if (error || !data) return new Map();
    return new Map(data.map((row) => [row.key, String(row.value ?? "")]));
  } catch {
    return new Map();
  }
}

export async function upsertSettings(
  entries: { key: string; value: string }[],
): Promise<void> {
  if (entries.length === 0) return;
  const { error } = await supabase
    .from("settings")
    .upsert(
      entries.map(({ key, value }) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
}
