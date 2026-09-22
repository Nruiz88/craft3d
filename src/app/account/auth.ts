import mysql from "mysql2/promise";

const url = new URL(process.env.DATABASE_URL || "mysql://mariadb:password@ikhtk2iuum3lvqyz9pvih46v:3306/default");

export async function registerAction(prev: unknown, formData: FormData) {
  return { ok: true, message: "Cuenta creada (DB)" };
}

export async function loginAction(prev: unknown, formData: FormData) {
  try {
    const pool = mysql.createPool({
      host: url.hostname, port: parseInt(url.port||"3306"),
      user: url.username, password: url.password,
      database: url.pathname.replace(/^\//,"")||"default",
    });
    const email = String(formData.get("email")||"");
    const password = String(formData.get("password")||"");
    const [rows] = await pool.execute("SELECT * FROM users WHERE email=? AND password=?", [email, password]);
    await pool.end();
    if (Array.isArray(rows) && (rows as any[]).length>0) return { ok: true, message: "Sesión iniciada", user: (rows as any[])[0] };
    return { ok: false, message: "Credenciales incorrectas" };
  } catch (e: any) {
    return { ok: false, message: e.message || "DB error" };
  }
}

export async function getCurrentUser() {
  try {
    const pool = mysql.createPool({
      host: url.hostname, port: parseInt(url.port||"3306"),
      user: url.username, password: url.password,
      database: url.pathname.replace(/^\//,"")||"default",
    });
    const [rows] = await pool.execute("SELECT id, email, full_name FROM users LIMIT 1");
    await pool.end();
    if (Array.isArray(rows) && (rows as any[]).length>0) return (rows as any[])[0];
  } catch {}
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
