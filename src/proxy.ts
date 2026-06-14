import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/api/auth/login", "/api/auth/logout"];

const ROLE_ROUTES: Record<string, string[]> = {
  "/employees": ["ADMIN", "MANAGER"],
  "/api/employees": ["ADMIN", "MANAGER"],
  "/finance": ["ADMIN", "MANAGER"],
  "/api/expenses": ["ADMIN", "MANAGER"],
  "/analytics": ["ADMIN", "MANAGER"],
  "/api/analytics": ["ADMIN", "MANAGER"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("sme_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("sme_token");
    return response;
  }

  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", String(payload.userId));
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-name", payload.name);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};