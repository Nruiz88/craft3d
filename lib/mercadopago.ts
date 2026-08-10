import "server-only";

const API_BASE = "https://api.mercadopago.com";

export interface MercadoPagoItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface MercadoPagoPreference {
  id: string;
  initPoint: string;
}

function mpFetch(path: string, accessToken: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function createPreference({
  accessToken,
  items,
  externalReference,
  notificationUrl,
  backUrls,
}: {
  accessToken: string;
  items: MercadoPagoItem[];
  externalReference: string;
  notificationUrl: string;
  backUrls: { success: string; pending: string; failure: string };
}): Promise<MercadoPagoPreference> {
  const body = {
    items: items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: "ARS",
    })),
    external_reference: externalReference,
    notification_url: notificationUrl,
    auto_return: "approved",
    back_urls: {
      success: backUrls.success,
      pending: backUrls.pending,
      failure: backUrls.failure,
    },
  };

  const res = await mpFetch("/checkout/preferences", accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Mercado Pago no pudo crear la preferencia (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  const data = (await res.json()) as {
    id: string;
    init_point?: string;
  };

  if (!data.init_point) {
    throw new Error("Mercado Pago no devolvió una URL de pago");
  }

  return { id: data.id, initPoint: data.init_point };
}

export async function getMercadoPagoPayment({
  accessToken,
  paymentId,
}: {
  accessToken: string;
  paymentId: string;
}): Promise<{
  status: string;
  externalReference: string | null;
}> {
  const res = await mpFetch(`/v1/payments/${paymentId}`, accessToken);
  if (!res.ok) {
    throw new Error(`Mercado Pago no pudo verificar el pago (${res.status})`);
  }

  const data = (await res.json()) as {
    status?: string;
    external_reference?: string | null;
  };

  return {
    status: String(data.status ?? ""),
    externalReference: data.external_reference ?? null,
  };
}
