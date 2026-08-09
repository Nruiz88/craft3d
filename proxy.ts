import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    if (
      user &&
      (pathname === "/ingresar" || pathname === "/registrarse")
    ) {
      const target = request.nextUrl.clone();
      target.pathname = "/cuenta";
      target.search = "";
      return NextResponse.redirect(target);
    }

    if (!user && pathname.startsWith("/cuenta")) {
      const target = request.nextUrl.clone();
      target.pathname = "/ingresar";
      target.search = "";
      target.searchParams.set("next", pathname);
      return NextResponse.redirect(target);
    }
  }

  return response;
}

export const config = {
  matcher: ["/ingresar", "/registrarse", "/cuenta/:path*"],
};
