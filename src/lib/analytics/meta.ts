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

export function trackMeta(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params);
  } catch {
    // nunca romper la UI por un evento de tracking
  }
}

export {};
