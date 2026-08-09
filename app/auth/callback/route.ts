import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;

export async function GET(request: NextRequest) {
  if (!url || !anonKey) {
    return NextResponse.redirect(new URL("/ingresar?error=config", request.url));
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next") ?? "/cuenta";

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
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
          // No se pueden setear cookies durante el render
        }
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL("/ingresar?error=oauth", origin),
      );
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "email",
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(
        new URL("/ingresar?error=confirmacion", origin),
      );
    }
  } else {
    return NextResponse.redirect(new URL("/ingresar", origin));
  }

  const target = nextParam.startsWith("/") && !nextParam.startsWith("//")
    ? nextParam
    : "/cuenta";
  return NextResponse.redirect(new URL(target, origin));
}
