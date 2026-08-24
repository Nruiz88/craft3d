"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import {
  savePaymentSettings,
  saveReservationSettings,
  saveShippingSettings,
} from "@/lib/payments/settings";
import { logAdminAction } from "@/lib/admin/admin-log";
import { checkAdminRateLimit } from "@/lib/utils/admin-rate-limit";
import { validateCsrfToken } from "@/lib/utils/csrf";
import type { AdminFormState } from "./helpers";

export async function saveSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const rl = checkAdminRateLimit("save-settings", 5, 60 * 1000);
  if (!rl.allowed) return { error: rl.error };
  if (!(await validateCsrfToken(String(formData.get("csrf_token") ?? "")))) return { error: "Token CSRF inválido" };

  try {
    const str = (name: string) => String(formData.get(name) ?? "").trim();

    const accessToken = str("mp_access_token");
    const publicKey = str("mp_public_key");
    const reservationPctRaw = str("reservation_pct");
    const reservationPct = Number(reservationPctRaw);
    const reservationFixedRaw = str("reservation_fixed");
    const reservationFixed = Number(reservationFixedRaw);

    await savePaymentSettings({
      mercadopago: {
        accessToken: formData.get("clearMpAccessToken") === "on" ? "" : accessToken || undefined,
        publicKey: formData.get("clearMpPublicKey") === "on" ? "" : publicKey || undefined,
      },
      transfer: {
        bankName: str("transfer_bank_name"),
        holder: str("transfer_holder"),
        cbu: str("transfer_cbu"),
        alias: str("transfer_alias"),
        note: str("transfer_note"),
      },
    });

    await saveReservationSettings({
      enabled: formData.get("reservation_enabled") === "on",
      mode: str("reservation_mode") === "fixed" ? "fixed" : "pct",
      depositPct: reservationPctRaw && Number.isFinite(reservationPct) ? reservationPct : undefined,
      depositFixed: reservationFixedRaw && Number.isFinite(reservationFixed) ? reservationFixed : undefined,
      note: str("reservation_note") || undefined,
    });

    const shippingFreeRaw = str("shipping_free_from");
    const shippingFree = Number(shippingFreeRaw);
    const weightRaw = str("correo_weight_grams");
    const weight = Number(weightRaw);

    await saveShippingSettings({
      correo: {
        enabled: formData.get("shipping_enabled") === "on",
        customerId: formData.get("clearCorreoCustomerId") === "on" ? "" : str("correo_customer_id") || undefined,
        userToken: formData.get("clearCorreoUserToken") === "on" ? "" : str("correo_user_token") || undefined,
        passwordToken: formData.get("clearCorreoPasswordToken") === "on" ? "" : str("correo_password_token") || undefined,
        postalCodeOrigin: str("correo_postal_code_origin") || undefined,
        weightGrams: weightRaw && Number.isFinite(weight) ? weight : undefined,
        environment: str("correo_environment") === "TEST" ? "TEST" : "PROD",
      },
      freeShipping: {
        enabled: formData.get("shipping_free_enabled") === "on",
        from: shippingFreeRaw && Number.isFinite(shippingFree) ? shippingFree : undefined,
      },
    });

    await logAdminAction("configuracion", "guardar ajustes");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar la configuración" };
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/carrito");
  revalidatePath("/drops");
  return {};
}
