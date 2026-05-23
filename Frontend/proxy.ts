import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME } from "@/lib/auth-cookie";

const getDefaultRouteForRole = (role?: string) =>
  role === "customer" ? "/" : "/dashboard";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;
  const { pathname, search } = request.nextUrl;

  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/account")) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/dashboard") && token && role === "customer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && token) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/login", "/signup"],
};
