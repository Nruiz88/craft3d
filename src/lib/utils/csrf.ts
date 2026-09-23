import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token CSRF stateless: HMAC(secret, expiración) con ventana de 12 horas.
 *
 * - No escribe cookies (seguro de usar durante el render de Server Components).
 * - No requiere estado server-side.
 * - Un sitio externo no puede obtenerlo (same-origin policy) ni fabricarlo
 *   (necesitaría JWT_SECRET). Las acciones ya exigen sesión admin, esto
 *   agrega la defensa de CSRF clásica.
 */

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

function secret(): string {
  // Fail-closed: sin secret no hay tokens CSRF válidos.
  const s = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("JWT_SECRET o NEXTAUTH_SECRET no configurado");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export async function getCsrfToken(): Promise<string> {
  const exp = Math.floor((Date.now() + TOKEN_TTL_MS) / 1000).toString();
  return `${exp}.${sign(exp)}`;
}

export async function validateCsrfToken(tokenFromForm: string): Promise<boolean> {
  if (!tokenFromForm) return false;
  try {
    return validateCsrfTokenInner(tokenFromForm);
  } catch {
    // Secret ausente: rechazar.
    return false;
  }
}

function validateCsrfTokenInner(tokenFromForm: string): boolean {
  const [expRaw, sig] = tokenFromForm.split(".");
  if (!expRaw || !sig) return false;
  const expected = sign(expRaw);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  const exp = Number(expRaw);
  return Number.isInteger(exp) && exp * 1000 > Date.now();
}
