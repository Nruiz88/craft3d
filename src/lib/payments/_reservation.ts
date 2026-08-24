import { fetchSettings, upsertSettings } from "./_helpers";

export interface ReservationSettings {
  enabled: boolean;
  mode: "pct" | "fixed";
  depositPct: number;
  depositFixed: number;
  note: string;
}

export interface ReservationSettingsInput {
  enabled?: boolean;
  mode?: "pct" | "fixed";
  depositPct?: number;
  depositFixed?: number;
  note?: string;
}

const empty: ReservationSettings = {
  enabled: false,
  mode: "pct",
  depositPct: 30,
  depositFixed: 0,
  note: "",
};

export async function getReservationSettings(): Promise<ReservationSettings> {
  const settings: ReservationSettings = structuredClone(empty);
  const map = await fetchSettings([
    "reservation_enabled", "reservation_mode", "reservation_pct",
    "reservation_fixed", "reservation_note",
  ]);

  settings.enabled = map.get("reservation_enabled") === "1";
  settings.mode = map.get("reservation_mode") === "fixed" ? "fixed" : "pct";
  const pct = Number(map.get("reservation_pct"));
  settings.depositPct = Number.isFinite(pct) && pct > 0 ? Math.min(100, Math.round(pct)) : 30;
  const fixed = Number(map.get("reservation_fixed"));
  settings.depositFixed = Number.isFinite(fixed) && fixed >= 0 ? Math.round(fixed) : 0;
  settings.note = map.get("reservation_note") ?? "";

  return settings;
}

export async function saveReservationSettings(input: ReservationSettingsInput): Promise<void> {
  const entries: { key: string; value: string }[] = [];

  if (input.enabled != null) entries.push({ key: "reservation_enabled", value: input.enabled ? "1" : "0" });
  if (input.mode != null) entries.push({ key: "reservation_mode", value: input.mode === "fixed" ? "fixed" : "pct" });
  if (input.depositPct != null && Number.isFinite(input.depositPct)) {
    entries.push({ key: "reservation_pct", value: String(Math.max(1, Math.min(100, Math.round(input.depositPct)))) });
  }
  if (input.depositFixed != null && Number.isFinite(input.depositFixed)) {
    entries.push({ key: "reservation_fixed", value: String(Math.max(0, Math.round(input.depositFixed))) });
  }
  if (input.note != null) entries.push({ key: "reservation_note", value: input.note });

  await upsertSettings(entries);
}
