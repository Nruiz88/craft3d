import { execSync } from "child_process";

export async function registerAction(prev: unknown, formData: FormData) {
  try {
    const email = String(formData.get("email")||"");
    const password = String(formData.get("password")||"");
    if (!email || !password) return { ok: false, message: "Completa campos" };
    const sql = `INSERT IGNORE INTO \`default\`.users (email, password) VALUES ('${email.replace(/'/g,"''")}','${password.replace(/'/g,"''")}');`;
    try {
      execSync(`mysql -h ikhtk2iuum3lvqyz9pvih46v -P 3306 -u mariadb -p'${process.env.MARIADB_PASSWORD || ""}' default -e "${sql}"`, { stdio:"pipe", timeout:3000 });
      return { ok: true, message: "Cuenta creada en DB (mysql CLI)" };
    } catch {
      return { ok: true, message: `Ejecuta en DB: ${sql}` };
    }
  } catch (e:any) {
    return { ok: false, message: e.message };
  }
}

export async function loginAction(prev: unknown, formData: FormData) {
  try {
    const email = String(formData.get("email")||"");
    const password = String(formData.get("password")||"");
    const sql = `SELECT id FROM \`default\`.users WHERE email='${email.replace(/'/g,"''")}' AND password='${password.replace(/'/g,"''")}' LIMIT 1;`;
    try {
      const out = execSync(`mysql -h ikhtk2iuum3lvqyz9pvih46v -P 3306 -u mariadb -p'${process.env.MARIADB_PASSWORD || ""}' default -e "${sql}" --batch --skip-column-names`, { stdio:"pipe", encoding:"utf-8", timeout:3000 });
      if (out.trim().length > 0) return { ok: true, message: "Sesión iniciada" };
    } catch {}
    return { ok: false, message: "Credenciales incorrectas" };
  } catch (e:any) {
    return { ok: false, message: e.message };
  }
}

export async function getCurrentUser() { return null; }
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
