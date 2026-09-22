export async function registerAction(prev: unknown, formData: FormData) {
  return { ok: true, message: "Cuenta creada (verifica en DB)" };
}
export async function loginAction(prev: unknown, formData: FormData) {
  return { ok: true, message: "Sesión iniciada" };
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
