import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Stub: redirect logic preserved without supabase dependency
  // Auth handled by MariaDB/JWT in app routes
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  return response;
}

export const config = {
  matcher: ["/ingresar", "/registrarse", "/cuenta/:path*"],
};
