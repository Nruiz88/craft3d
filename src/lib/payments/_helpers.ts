import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";

export type SettingsKey = string;

export async function getSetting(key: SettingsKey): Promise<string> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0]?.value ?? "";
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function fetchSettings(keys: string[]): Promise<Map<string, string>> {
  if (keys.length === 0) return new Map();
  const rows = await db.select().from(settings).where(inArray(settings.key, keys));
  const map = new Map<string, string>();
  for (const k of keys) map.set(k, "");
  for (const row of rows) map.set(row.key, row.value ?? "");
  return map;
}

export async function upsertSettings(entries: { key: string; value: string }[]): Promise<void> {
  for (const entry of entries) {
    await db
      .insert(settings)
      .values({ key: entry.key, value: entry.value })
      .onDuplicateKeyUpdate({ set: { value: entry.value } })
      .execute();
  }
}
