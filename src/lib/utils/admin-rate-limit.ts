import { checkRateLimit } from "@/lib/utils/rate-limit";

/**
 * Rate limit wrapper for admin actions.
 * Uses a per-action key with IP-based isolation.
 */
export function checkAdminRateLimit(
  action: string,
  maxAttempts = 10,
  windowMs = 60 * 1000, // 1 minute default
): { allowed: boolean; error?: string } {
  const rl = checkRateLimit(`admin:${action}`, maxAttempts, windowMs);
  if (!rl.allowed) {
    return {
      allowed: false,
      error: `Demasiadas acciones. Esperá ${Math.ceil(rl.resetMs / 60000)} min.`,
    };
  }
  return { allowed: true };
}
