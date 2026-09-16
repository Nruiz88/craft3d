import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // JWT de NextAuth (Edge-safe: solo descifra la cookie, sin DB).
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
  });

  const { pathname } = request.nextUrl;

  if (token && (pathname === "/ingresar" || pathname === "/registrarse")) {
    const target = request.nextUrl.clone();
    target.pathname = "/cuenta";
    target.search = "";
    return NextResponse.redirect(target);
  }

  if (!token && pathname.startsWith("/cuenta")) {
    const target = request.nextUrl.clone();
    target.pathname = "/ingresar";
    target.search = "";
    target.searchParams.set("next", pathname);
    return NextResponse.redirect(target);
  }

  // Zona admin: requiere rol admin (el layout también lo verifica).
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const role = token?.role as string | undefined;
    if (!token || role !== "admin") {
      const target = request.nextUrl.clone();
      target.pathname = token ? "/cuenta" : "/admin/login";
      target.search = "";
      return NextResponse.redirect(target);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ingresar", "/registrarse", "/cuenta/:path*", "/admin/:path*"],
};
