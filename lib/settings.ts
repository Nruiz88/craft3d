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

export interface ShippingSettings {
  correo: {
    enabled: boolean;
    customerId: string;
    userToken: string;
    passwordToken: string;
    postalCodeOrigin: string;
    weightGrams: number;
    environment: "PROD" | "TEST";
  };
  freeShipping: {
    enabled: boolean;
    from: number;
  };
}

export interface ShippingSettingsInput {
  correo?: Partial<{
    enabled: boolean;
    customerId: string;
    userToken: string;
    passwordToken: string;
    postalCodeOrigin: string;
    weightGrams: number;
    environment: "PROD" | "TEST";
  }>;
  freeShipping?: Partial<{ enabled: boolean; from: number }>;
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
  mode: "pct",
  depositPct: 30,
  depositFixed: 0,
  note: "",
};

export async function getReservationSettings(): Promise<ReservationSettings> {
  const settings: ReservationSettings = structuredClone(reservationEmpty);

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "reservation_enabled",
        "reservation_mode",
        "reservation_pct",
        "reservation_fixed",
        "reservation_note",
      ]);
    if (error || !data) return settings;

    const map = new Map(data.map((row) => [row.key, String(row.value ?? "")]));
    settings.enabled = map.get("reservation_enabled") === "1";
    settings.mode = map.get("reservation_mode") === "fixed" ? "fixed" : "pct";
    const pct = Number(map.get("reservation_pct"));
    settings.depositPct =
      Number.isFinite(pct) && pct > 0 ? Math.min(100, Math.round(pct)) : 30;
    const fixed = Number(map.get("reservation_fixed"));
    settings.depositFixed =
      Number.isFinite(fixed) && fixed >= 0 ? Math.round(fixed) : 0;
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
  if (input.mode != null) {
    entries.push({
      key: "reservation_mode",
      value: input.mode === "fixed" ? "fixed" : "pct",
    });
  }
  if (input.depositPct != null && Number.isFinite(input.depositPct)) {
    entries.push({
      key: "reservation_pct",
      value: String(Math.max(1, Math.min(100, Math.round(input.depositPct)))),
    });
  }
  if (input.depositFixed != null && Number.isFinite(input.depositFixed)) {
    entries.push({
      key: "reservation_fixed",
      value: String(Math.max(0, Math.round(input.depositFixed))),
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

const shippingEmpty: ShippingSettings = {
  correo: {
    enabled: false,
    customerId: "",
    userToken: "",
    passwordToken: "",
    postalCodeOrigin: "8300",
    weightGrams: 500,
    environment: "PROD",
  },
  freeShipping: {
    enabled: true,
    from: 80000,
  },
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  const settings: ShippingSettings = structuredClone(shippingEmpty);

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "correo_enabled",
        "correo_customer_id",
        "correo_user_token",
        "correo_password_token",
        "correo_postal_code_origin",
        "correo_weight_grams",
        "correo_environment",
        "shipping_free_enabled",
        "shipping_free_from",
      ]);
    if (error || !data) return settings;

    const map = new Map(data.map((row) => [row.key, String(row.value ?? "")]));
    const get = (key: SettingsKey) => map.get(key) ?? "";

    settings.correo.enabled = get("correo_enabled") === "1";
    settings.correo.customerId = get("correo_customer_id");
    settings.correo.userToken = get("correo_user_token");
    settings.correo.passwordToken = get("correo_password_token");
    settings.correo.postalCodeOrigin =
      get("correo_postal_code_origin") || "8300";
    const weight = Number(get("correo_weight_grams"));
    settings.correo.weightGrams =
      Number.isFinite(weight) && weight > 0
        ? Math.min(25000, Math.round(weight))
        : 500;
    settings.correo.environment =
      get("correo_environment") === "TEST" ? "TEST" : "PROD";

    settings.freeShipping.enabled = get("shipping_free_enabled") !== "0";
    const from = Number(get("shipping_free_from"));
    settings.freeShipping.from =
      Number.isFinite(from) && from >= 0 ? Math.round(from) : 80000;
  } catch {
    return settings;
  }

  return settings;
}

export async function saveShippingSettings(
  input: ShippingSettingsInput,
): Promise<void> {
  const entries: { key: string; value: string }[] = [];

  const set = (key: string, value: string | undefined) => {
    if (value != null) entries.push({ key, value });
  };

  if (input.correo?.enabled != null) {
    set("correo_enabled", input.correo.enabled ? "1" : "0");
  }
  set("correo_customer_id", input.correo?.customerId);
  set("correo_user_token", input.correo?.userToken);
  set("correo_password_token", input.correo?.passwordToken);
  set("correo_postal_code_origin", input.correo?.postalCodeOrigin);
  if (input.correo?.weightGrams != null && Number.isFinite(input.correo.weightGrams)) {
    const weight = Math.max(1, Math.min(25000, Math.round(input.correo.weightGrams)));
    set("correo_weight_grams", String(weight));
  }
  set(
    "correo_environment",
    input.correo?.environment === "PROD" || input.correo?.environment === "TEST"
      ? input.correo.environment
      : undefined,
  );

  if (input.freeShipping?.enabled != null) {
    set("shipping_free_enabled", input.freeShipping.enabled ? "1" : "0");
  }
  if (input.freeShipping?.from != null && Number.isFinite(input.freeShipping.from)) {
    set("shipping_free_from", String(Math.max(0, Math.round(input.freeShipping.from))));
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
