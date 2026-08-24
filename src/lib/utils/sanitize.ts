/**
 * Input sanitization utilities for admin forms.
 * Prevents stored XSS and injection attacks.
 */

/** Remove HTML tags and dangerous characters from user input. */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/** Sanitize a string but keep basic formatting (newlines for descriptions). */
export function sanitizeMultiline(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "") // Remove object tags
    .replace(/<embed\b[^<]*\/?>/gi, "") // Remove embed tags
    .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
    .replace(/on\w+='[^']*'/gi, "") // Remove event handlers (single quotes)
    .trim();
}

/** Sanitize an array of strings (for tags, details, etc). */
export function sanitizeArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => sanitizeString(item))
    .filter((item) => item.length > 0);
}

/** Validate and sanitize a numeric field. */
export function sanitizeNumber(input: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  if (input === null || input === undefined || input === "") return null;
  const num = Number(input);
  if (!Number.isFinite(num)) return null;
  return Math.max(min, Math.min(max, num));
}

/** Validate a slug format (alphanumeric + hyphens only). */
export function sanitizeSlug(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
