import mysql from "mysql2/promise";

const url = new URL(process.env.DATABASE_URL || "mysql://mariadb:password@ikhtk2iuum3lvqyz9pvih46v:3306/default");

export interface Profile { id: string; full_name: string | null; email?: string; }

export async function getCurrentUser() {
  try {
    const pool = mysql.createPool({ host: url.hostname, port: parseInt(url.port||"3306"), user: url.username, password: url.password, database: url.pathname.replace(/^\//,"")||"default" });
    const [rows] = await pool.execute("SELECT id, email, full_name FROM users LIMIT 1");
    await pool.end();
    if (Array.isArray(rows) && (rows as any[]).length>0) return (rows as any[])[0] as Profile;
  } catch {}
  return null;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("No autenticado");
  return u;
}
