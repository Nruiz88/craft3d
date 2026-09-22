import mysql from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL || "mysql://mariadb:password@ikhtk2iuum3lvqyz9pvih46v:3306/default";

export function getPool() {
  const url = new URL(dbUrl);
  return mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port || "3306"),
    user: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, "") || "default",
    waitForConnections: true,
    connectionLimit: 5,
  });
}

export async function registerAction(prev: unknown, formData: FormData) {
  try {
    const pool = getPool();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) return { ok: false, message: "Completa todos los campos" };

    await pool.execute(
      `INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())`,
      [email, password]
    );
    await pool.end();
    return { ok: true, message: "Cuenta creada" };
  } catch (e: any) {
    return { ok: false, message: e.message || "Error al crear cuenta" };
  }
}

export async function loginAction(prev: unknown, formData: FormData) {
  try {
    const pool = getPool();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
    await pool.end();
    if (Array.isArray(rows) && rows.length > 0) return { ok: true, message: "Sesión iniciada" };
    return { ok: false, message: "Credenciales incorrectas" };
  } catch (e: any) {
    return { ok: false, message: e.message || "Error" };
  }
}

export async function getCurrentUser() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT id, email FROM users LIMIT 1");
    await pool.end();
    if (Array.isArray(rows) && rows.length > 0) return rows[0] as any;
  } catch (e) { /* sin DB o sin datos */ }
  return null;
}

export async function updateProfileAction() { return { ok: true }; }
export async function googleLoginAction() { return { ok: true }; }
export async function validateCouponAction() { return { ok: true }; }
export async function logoutUserAction() { return { ok: true }; }
export async function signUp() { return { data: null, error: null }; }
export async function signInWithPassword() { return { data: null, error: null }; }
export async function getUser() { return { data: { user: null }, error: null }; }
export async function signOut() { return { error: null }; }
export async function signInWithOAuth() { return { data: null, error: null }; }
export async function requireUser() { return null; }
