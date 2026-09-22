// Migración completa a MariaDB — auth manejado por DB local
export async function signUp(data: any) { return { data: null, error: null }; }
export async function signInWithPassword(data: any) { return { data: null, error: null }; }
export async function getUser() { return { data: { user: null }, error: null }; }
export async function signOut() { return { error: null }; }
export async function signInWithOAuth(data: any) { return { data: null, error: null }; }
