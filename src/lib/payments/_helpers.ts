import "server-only";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";

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

export async function fetchSettings(
  keys: SettingsKey[],
): Promise<Map<string, string>> {
  try {
    if (keys.length === 0) return new Map();
    const rows = await db
      .select({ key: settings.key, value: settings.value })
      .from(settings)
      .where(inArray(settings.key, keys));
    return new Map(rows.map((row) => [row.key, String(row.value ?? "")]));
  } catch {
    return new Map();
  }
}

export async function upsertSettings(
  entries: { key: string; value: string }[],
): Promise<void> {
  if (entries.length === 0) return;
  try {
    await db
      .insert(settings)
      .values(
        entries.map(({ key, value }) => ({
          key,
          value,
          updated_at: new Date(),
        })),
      )
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: sql`excluded.value`, updated_at: new Date() },
      });
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo guardar",
    );
  }
}
