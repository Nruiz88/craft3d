import { fetchSettings, upsertSettings } from "./_helpers";

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

const empty: ShippingSettings = {
  correo: {
    enabled: false,
    customerId: "",
    userToken: "",
    passwordToken: "",
    postalCodeOrigin: "8300",
    weightGrams: 500,
    environment: "PROD",
  },
  freeShipping: { enabled: true, from: 80000 },
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  const settings: ShippingSettings = structuredClone(empty);
  const map = await fetchSettings([
    "correo_enabled", "correo_customer_id", "correo_user_token",
    "correo_password_token", "correo_postal_code_origin",
    "correo_weight_grams", "correo_environment",
    "shipping_free_enabled", "shipping_free_from",
  ]);

  settings.correo.enabled = map.get("correo_enabled") === "1";
  settings.correo.customerId = map.get("correo_customer_id") ?? "";
  settings.correo.userToken = map.get("correo_user_token") ?? "";
  settings.correo.passwordToken = map.get("correo_password_token") ?? "";
  settings.correo.postalCodeOrigin = map.get("correo_postal_code_origin") || "8300";
  const weight = Number(map.get("correo_weight_grams"));
  settings.correo.weightGrams = Number.isFinite(weight) && weight > 0 ? Math.min(25000, Math.round(weight)) : 500;
  settings.correo.environment = map.get("correo_environment") === "TEST" ? "TEST" : "PROD";
  settings.freeShipping.enabled = map.get("shipping_free_enabled") !== "0";
  const from = Number(map.get("shipping_free_from"));
  settings.freeShipping.from = Number.isFinite(from) && from >= 0 ? Math.round(from) : 80000;

  return settings;
}

export async function saveShippingSettings(input: ShippingSettingsInput): Promise<void> {
  const entries: { key: string; value: string }[] = [];
  const set = (key: string, value: string | undefined) => {
    if (value != null) entries.push({ key, value });
  };

  if (input.correo?.enabled != null) set("correo_enabled", input.correo.enabled ? "1" : "0");
  set("correo_customer_id", input.correo?.customerId);
  set("correo_user_token", input.correo?.userToken);
  set("correo_password_token", input.correo?.passwordToken);
  set("correo_postal_code_origin", input.correo?.postalCodeOrigin);
  if (input.correo?.weightGrams != null && Number.isFinite(input.correo.weightGrams)) {
    set("correo_weight_grams", String(Math.max(1, Math.min(25000, Math.round(input.correo.weightGrams)))));
  }
  set("correo_environment", input.correo?.environment === "PROD" || input.correo?.environment === "TEST" ? input.correo.environment : undefined);
  if (input.freeShipping?.enabled != null) set("shipping_free_enabled", input.freeShipping.enabled ? "1" : "0");
  if (input.freeShipping?.from != null && Number.isFinite(input.freeShipping.from)) {
    set("shipping_free_from", String(Math.max(0, Math.round(input.freeShipping.from))));
  }

  await upsertSettings(entries);
}
