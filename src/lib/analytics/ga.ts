/**
 * Helper cliente para eventos de Google Analytics 4 (gtag). Es seguro llamarlo
 * siempre: si gtag no está cargado (no hay NEXT_PUBLIC_GA_ID) o estamos en el
 * servidor, no hace nada. Se usa para los eventos de e-commerce (view_item,
 * add_to_cart, purchase) que permiten medir conversión por canal en GA4.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Moneda de la tienda para los eventos de valor de GA4. */
export const GA_CURRENCY = "ARS";

export function trackGa(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", event, params);
  } catch {
    // nunca romper la UI por un evento de tracking
  }
}

export {};
