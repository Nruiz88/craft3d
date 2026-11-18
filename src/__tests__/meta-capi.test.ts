import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { buildPurchaseEvent, normalizePhone } from "@/lib/analytics/meta-capi";
import { purchaseEventId } from "@/lib/analytics/meta";
import type { Order } from "@/lib/products/types";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

const order = {
  id: 42,
  user_id: null,
  customer_name: "Cliente",
  customer_email: " Cliente@Mail.com ",
  shipping_phone: "0299 15-555-1234",
  shipping_city: "Neuquén",
  shipping_postal_code: "Q8300",
  total: 15000,
  items: [
    { product_id: 1, product_slug: "goku", product_name: "Goku", price: 5000, quantity: 2, subtotal: 10000 },
    { product_id: 2, product_slug: "llavero", product_name: "Llavero", price: 5000, quantity: 1, subtotal: 5000 },
  ],
} as unknown as Order;

describe("Meta Conversions API - Purchase", () => {
  it("normaliza teléfonos argentinos con código de país", () => {
    expect(normalizePhone("0299 15-555-1234")).toBe("54299155551234");
    expect(normalizePhone("+54 9 11 1234-5678")).toBe("5491112345678");
    expect(normalizePhone("")).toBe("");
  });

  it("usa el mismo event_id que el navegador para deduplicar", () => {
    const ev = buildPurchaseEvent(order, "https://craft3d.com.ar", 1_700_000_000_000);
    expect(ev.event_id).toBe(purchaseEventId(42));
    expect(ev.event_time).toBe(1_700_000_000);
    expect(ev.action_source).toBe("website");
  });

  it("hashea los datos del cliente y omite los vacíos", () => {
    const ev = buildPurchaseEvent(order, "https://craft3d.com.ar");
    expect(ev.user_data.em).toEqual([sha("cliente@mail.com")]);
    expect(ev.user_data.country).toEqual([sha("ar")]);
    expect(ev.user_data.external_id).toBeUndefined();
  });

  it("manda valor, moneda y productos del pedido", () => {
    const ev = buildPurchaseEvent(order, "https://craft3d.com.ar");
    expect(ev.custom_data.value).toBe(15000);
    expect(ev.custom_data.currency).toBe("ARS");
    expect(ev.custom_data.content_ids).toEqual(["goku", "llavero"]);
    expect(ev.custom_data.num_items).toBe(3);
  });
});
