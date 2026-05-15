import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/superadmin")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "super_admin")
      return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "admin" && role !== "super_admin")
      return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*", "/admin/:path*", "/dashboard/:path*"],
};
