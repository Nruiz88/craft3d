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

type SettingsKey =
  | "mp_access_token"
  | "mp_public_key"
  | "transfer_bank_name"
  | "transfer_holder"
  | "transfer_cbu"
  | "transfer_alias"
  | "transfer_note";

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
