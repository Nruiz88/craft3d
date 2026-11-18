/**
 * Helper cliente para disparar eventos al Píxel de Meta (fbq).
 * Es seguro llamarlo siempre: si el píxel no está cargado (no hay
 * NEXT_PUBLIC_FB_PIXEL_ID) o estamos en el servidor, no hace nada.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Moneda de la tienda para los eventos de valor (Meta la usa para el ROAS). */
export const META_CURRENCY = "ARS";

/**
 * event_id del Purchase de un pedido. Lo comparten el navegador y la
 * Conversions API (servidor) para que Meta cuente una sola compra.
 */
export function purchaseEventId(orderId: number | string): string {
  return `purchase-${orderId}`;
}

export function trackMeta(
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    if (options?.eventID) window.fbq("track", event, params, { eventID: options.eventID });
    else window.fbq("track", event, params);
  } catch {
    // nunca romper la UI por un evento de tracking
  }
}

export {};
