import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta ${name} en .env.local`);
  }
  return value;
}

const url = requireEnv("SUPABASE_URL");
const anonKey = requireEnv("SUPABASE_PUBLISHABLE_KEY");

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // No se pueden setear cookies durante el render de un Server Component
        }
      },
    },
  });
}
