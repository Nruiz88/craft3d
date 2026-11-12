"use client";

import { useEffect } from "react";
import { trackMeta, META_CURRENCY } from "@/lib/analytics/meta";
import { trackGa, GA_CURRENCY } from "@/lib/analytics/ga";

/**
 * Dispara el evento "Purchase" de Meta cuando MercadoPago devuelve al
 * cliente a /carrito?pago=exito. Usa sessionStorage para no contar dos
 * veces la misma compra si el cliente recarga la página de gracias.
 */
export default function PurchaseTracker({
  orderId,
  value,
  contentIds,
}: {
  orderId: string;
  value: number;
  contentIds: string[];
}) {
  useEffect(() => {
    if (!orderId) return;
    const key = `mp_purchase_${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sin sessionStorage igual disparamos (peor caso: doble conteo raro)
    }
    trackMeta("Purchase", {
      value,
      currency: META_CURRENCY,
      content_ids: contentIds,
      content_type: "product",
      num_items: contentIds.length,
    });
    trackGa("purchase", {
      transaction_id: orderId,
      currency: GA_CURRENCY,
      value,
      items: contentIds.map((id) => ({ item_id: id })),
    });
  }, [orderId, value, contentIds]);

  return null;
}
