export async function registerAction() { return { ok: true, message: "Ejecuta en DB: INSERT INTO default.users (email,password) VALUES ('x','y')" }; }
export async function loginAction() { return { ok: true, message: "Verifica DB" }; }
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
