import { fetchSettings, upsertSettings } from "./_helpers";

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

const empty: PaymentSettings = {
  mercadopago: { accessToken: "", publicKey: "" },
  transfer: { bankName: "", holder: "", cbu: "", alias: "", note: "" },
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const settings: PaymentSettings = structuredClone(empty);
  const map = await fetchSettings([
    "mp_access_token", "mp_public_key",
    "transfer_bank_name", "transfer_holder", "transfer_cbu", "transfer_alias", "transfer_note",
  ]);

  settings.mercadopago.accessToken = map.get("mp_access_token") ?? "";
  settings.mercadopago.publicKey = map.get("mp_public_key") ?? "";
  settings.transfer.bankName = map.get("transfer_bank_name") ?? "";
  settings.transfer.holder = map.get("transfer_holder") ?? "";
  settings.transfer.cbu = map.get("transfer_cbu") ?? "";
  settings.transfer.alias = map.get("transfer_alias") ?? "";
  settings.transfer.note = map.get("transfer_note") ?? "";

  return settings;
}

export async function savePaymentSettings(input: PaymentSettingsInput): Promise<void> {
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

  await upsertSettings(entries);
}
