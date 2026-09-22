import { getPool } from "@/app/account/auth";

export interface Profile { id: string; full_name: string | null; }

export async function getCurrentUser() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT id, full_name FROM users WHERE id = 1 LIMIT 1");
    await pool.end();
    if (Array.isArray(rows) && rows.length > 0) {
      const r = rows[0] as any;
      return { id: r.id, full_name: r.full_name, email: r.email };
    }
  } catch (e) {}
  return null;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("No autenticado");
  return u;
}
