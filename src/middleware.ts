/**
 * Next.js middleware for route protection.
 * Redirects unauthenticated users away from /dashboard and /report.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = request.cookies.has(AUTH_COOKIE);

  // Authenticated user hitting /login → redirect to dashboard
  if (pathname === "/login" && hasAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected routes: /dashboard and /report require auth
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/report")) &&
    !hasAuth
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/report/:path*", "/login"],
};
