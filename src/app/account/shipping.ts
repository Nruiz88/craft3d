"use server";

import { checkRateLimit } from "@/lib/utils/rate-limit";

import { getShippingSettings } from "@/lib/payments/settings";
import { quoteCorreoShipping } from "@/lib/shipping/correoargentino";

export type QuoteShippingState =
  | {
      options?: {
        deliveredType: "D" | "S";
        label: string;
        price: number;
        timeMin: string;
        timeMax: string;
      }[];
      error?: string;
    }
  | undefined;

export async function quoteShippingAction(
  _prev: QuoteShippingState,
  formData: FormData,
): Promise<QuoteShippingState> {
  const rl = checkRateLimit("shipping-quote", 10, 5 * 60 * 1000);
  if (!rl.allowed) return { error: "Demasiadas consultas. Esperá unos minutos." };

  const postalCode = String(formData.get("postalCode") ?? "").trim();
  if (!/^\d{4}$/.test(postalCode)) {
    return { error: "Ingresá un código postal válido (4 dígitos)" };
  }

  let settings;
  try {
    settings = await getShippingSettings();
  } catch {
    return { error: "No se pudo leer la configuración de envío" };
  }

  if (!settings.correo.enabled) {
    return { error: "Los envíos por Correo Argentino no están habilitados" };
  }

  let quote;
  try {
    quote = await quoteCorreoShipping({
      customerId: settings.correo.customerId,
      userToken: settings.correo.userToken,
      passwordToken: settings.correo.passwordToken,
      postalCodeOrigin: settings.correo.postalCodeOrigin,
      postalCodeDestination: postalCode,
      weight: settings.correo.weightGrams,
      environment: settings.correo.environment,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo cotizar el envío a ese código postal",
    };
  }

  const options = [quote.domicilio, quote.sucursal].filter(
    (rate): rate is NonNullable<typeof quote.domicilio> => rate !== null,
  );

  if (options.length === 0) {
    return { error: "No hay envíos disponibles para ese código postal" };
  }

  return {
    options: options.map((rate) => ({
      deliveredType: rate.deliveredType,
      label: rate.deliveredType === "D" ? "A domicilio" : "Retiro en sucursal",
      price: rate.price,
      timeMin: rate.deliveryTimeMin,
      timeMax: rate.deliveryTimeMax,
    })),
  };
}
