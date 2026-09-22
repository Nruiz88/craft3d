// Migración completa a MariaDB — stubs
export type SettingsKey = "test";
export async function getSetting(key: string) { return ""; }
export async function getAllSettings() { return {}; }
export async function fetchSettings(keys: string[]): Promise<Map<string, string>> {
  const m = new Map<string, string>();
  for (const k of keys) m.set(k, "");
  return m;
}
export async function upsertSettings(entries: { key: string; value: string }[]): Promise<void> {}
