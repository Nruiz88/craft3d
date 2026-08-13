import "server-only";

const API_PROD = "https://api.correoargentino.com.ar/micorreo/v1";
const API_TEST = "https://apitest.correoargentino.com.ar/micorreo/v1";

export type CorreoEnvironment = "PROD" | "TEST";

export interface CorreoRate {
  deliveredType: "D" | "S";
  productType: string;
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
}

export interface CorreoRateRequest {
  customerId: string;
  userToken: string;
  passwordToken: string;
  postalCodeOrigin: string;
  postalCodeDestination: string;
  weight: number;
  height?: number;
  width?: number;
  length?: number;
  environment?: CorreoEnvironment;
}

function baseUrl(environment: CorreoEnvironment): string {
  return environment === "TEST" ? API_TEST : API_PROD;
}

function basicAuth(userToken: string, passwordToken: string): string {
  const credentials = `${userToken}:${passwordToken}`;
  return `Basic ${Buffer.from(credentials, "utf8").toString("base64")}`;
}

async function getToken(
  userToken: string,
  passwordToken: string,
  environment: CorreoEnvironment,
): Promise<string> {
  const res = await fetch(`${baseUrl(environment)}/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuth(userToken, passwordToken),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`MiCorreo token: HTTP ${res.status}`);
  }

  const data = (await res.json()) as { token?: string };
  const token = data.token;
  if (!token) throw new Error("MiCorreo no devolvió token");
  return token;
}

export interface CorreoQuotation {
  domicilio: CorreoRate | null;
  sucursal: CorreoRate | null;
}

export async function quoteCorreoShipping(
  request: CorreoRateRequest,
): Promise<CorreoQuotation> {
  const {
    customerId,
    userToken,
    passwordToken,
    postalCodeOrigin,
    postalCodeDestination,
    weight,
    height = 30,
    width = 25,
    length = 25,
    environment = "PROD",
  } = request;

  if (!customerId || !userToken || !passwordToken) {
    throw new Error("Correo Argentino no configurado");
  }
  if (!postalCodeDestination || !/^\d{4}$/.test(postalCodeDestination)) {
    throw new Error("Código postal inválido");
  }

  const token = await getToken(userToken, passwordToken, environment);

  const res = await fetch(`${baseUrl(environment)}/rates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
      postalCodeOrigin,
      postalCodeDestination,
      dimensions: {
        weight: Math.min(25000, Math.max(1, Math.round(weight))),
        height: Math.min(150, Math.max(1, height)),
        width: Math.min(150, Math.max(1, width)),
        length: Math.min(150, Math.max(1, length)),
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`MiCorreo rates: HTTP ${res.status}`);
  }

  const data = (await res.json()) as { rates?: CorreoRate[] };
  const rates = Array.isArray(data.rates) ? data.rates : [];

  const find = (deliveredType: "D" | "S"): CorreoRate | null => {
    const list = rates.filter(
      (rate) =>
        rate.deliveredType === deliveredType &&
        typeof rate.price === "number" &&
        Number.isFinite(rate.price),
    );
    return list.length > 0
      ? {
          ...list[0],
          price: Math.round(list[0].price * 100) / 100,
        }
      : null;
  };

  return {
    domicilio: find("D"),
    sucursal: find("S"),
  };
}
