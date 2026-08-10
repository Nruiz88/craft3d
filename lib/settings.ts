import "server-only";
import { supabase } from "./supabase";

export interface PaymentSettings {
  mercadopago: {
    accessToken: string;
    publicKey: string;
  };
  transfer: {
    bankName: string;
    holder: string;
    cbu: string;
    alias: string;
    note: string;
  };
}

export interface PaymentSettingsInput {
  mercadopago?: Partial<{ accessToken: string; publicKey: string }>;
  transfer?: Partial<{
    bankName: string;
    holder: string;
    cbu: string;
    alias: string;
    note: string;
  }>;
}

export interface ReservationSettings {
  enabled: boolean;
  depositPct: number;
  note: string;
}

export interface ReservationSettingsInput {
  enabled?: boolean;
  depositPct?: number;
  note?: string;
}

type SettingsKey =
  | "mp_access_token"
  | "mp_public_key"
  | "transfer_bank_name"
  | "transfer_holder"
  | "transfer_cbu"
  | "transfer_alias"
  | "transfer_note"
  | "reservation_enabled"
  | "reservation_pct"
  | "reservation_note";

const empty: PaymentSettings = {
  mercadopago: { accessToken: "", publicKey: "" },
  transfer: { bankName: "", holder: "", cbu: "", alias: "", note: "" },
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const settings: PaymentSettings = structuredClone(empty);

  try {
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error || !data) return settings;

    const map = new Map(data.map((row) => [row.key, String(row.value ?? "")]));
    const get = (key: SettingsKey) => map.get(key) ?? "";

    settings.mercadopago.accessToken = get("mp_access_token");
    settings.mercadopago.publicKey = get("mp_public_key");
    settings.transfer.bankName = get("transfer_bank_name");
    settings.transfer.holder = get("transfer_holder");
    settings.transfer.cbu = get("transfer_cbu");
    settings.transfer.alias = get("transfer_alias");
    settings.transfer.note = get("transfer_note");
  } catch {
    return settings;
  }

  return settings;
}

export async function savePaymentSettings(
  input: PaymentSettingsInput,
): Promise<void> {
  const entries: { key: string; value: string }[] = [];

  const set = (key: string, value: string | undefined) => {
    if (value != null) entries.push({ key, value });
  };

  set("mp_access_token", input.mercadopago?.accessToken);
  set("mp_public_key", input.mercadopago?.publicKey);
  set("transfer_bank_name", input.transfer?.bankName);
  set("transfer_holder", input.transfer?.holder);
  set("transfer_cbu", input.transfer?.cbu);
  set("transfer_alias", input.transfer?.alias);
  set("transfer_note", input.transfer?.note);

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

const reservationEmpty: ReservationSettings = {
  enabled: false,
  depositPct: 30,
  note: "",
};

export async function getReservationSettings(): Promise<ReservationSettings> {
  const settings: ReservationSettings = structuredClone(reservationEmpty);

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["reservation_enabled", "reservation_pct", "reservation_note"]);
    if (error || !data) return settings;

    const map = new Map(data.map((row) => [row.key, String(row.value ?? "")]));
    settings.enabled = map.get("reservation_enabled") === "1";
    const pct = Number(map.get("reservation_pct"));
    settings.depositPct =
      Number.isFinite(pct) && pct > 0 ? Math.min(100, Math.round(pct)) : 30;
    settings.note = map.get("reservation_note") ?? "";
  } catch {
    return settings;
  }

  return settings;
}

export async function saveReservationSettings(
  input: ReservationSettingsInput,
): Promise<void> {
  const entries: { key: string; value: string }[] = [];

  if (input.enabled != null) {
    entries.push({ key: "reservation_enabled", value: input.enabled ? "1" : "0" });
  }
  if (input.depositPct != null && Number.isFinite(input.depositPct)) {
    entries.push({
      key: "reservation_pct",
      value: String(Math.max(1, Math.min(100, Math.round(input.depositPct)))),
    });
  }
  if (input.note != null) {
    entries.push({ key: "reservation_note", value: input.note });
  }

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
