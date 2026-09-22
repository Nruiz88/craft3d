export async function registerAction(prev: unknown, formData: FormData) {
  const res = await fetch("/api/auth/register", { method: "POST", body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }), headers: { "Content-Type": "application/json" } });
  return res.json();
}
export async function loginAction(prev: unknown, formData: FormData) {
  const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }), headers: { "Content-Type": "application/json" } });
  return res.json();
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
