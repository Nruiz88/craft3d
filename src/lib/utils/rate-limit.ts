/**
 * In-memory rate limiter for server-side use.
 * Works within a single serverless function instance.
 * For distributed rate limiting, use Redis or Supabase.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check rate limit. Returns { allowed, remaining, resetMs }.
 * @param key - Unique identifier (e.g., "login:192.168.1.1")
 * @param maxAttempts - Max attempts allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetMs: windowMs };
  }

  entry.count++;

  if (entry.count > maxAttempts) {
    const resetMs = entry.resetAt - now;
    return { allowed: false, remaining: 0, resetMs };
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetMs: entry.resetAt - now,
  };
}

/**
 * Get client IP from request headers (Vercel/Next.js).
 */
export function getClientIp(request?: Request): string {
  if (!request) return "unknown";
  // Vercel sets x-forwarded-for
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
