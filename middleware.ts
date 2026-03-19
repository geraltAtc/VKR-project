import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from "./src/lib/adminAuth";

const isBypassedPath = (pathname: string): boolean =>
  pathname === "/admin/login" ||
  pathname === "/api/admin/login" ||
  pathname === "/api/admin/logout";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isBypassedPath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authorized = isValidAdminToken(sessionToken);
  if (authorized) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
