import "server-only";
import { join, basename, extname } from "path";

/**
 * Carpeta donde se guardan las imágenes subidas desde el admin.
 * En producción (Coolify) debe apuntar a un VOLUMEN PERSISTENTE, si no las
 * imágenes se pierden en cada redeploy. Configurable con UPLOADS_DIR.
 */
export function uploadsDir(): string {
  return process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
}

export const UPLOAD_CONTENT_TYPE: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

/** Valida un nombre de archivo servible (sin path traversal). Devuelve null si es inválido. */
export function safeUploadName(name: string): string | null {
  const base = basename(name);
  if (base !== name || base.includes("..") || !SAFE_NAME.test(base)) return null;
  if (!(extname(base).toLowerCase() in UPLOAD_CONTENT_TYPE)) return null;
  return base;
}
