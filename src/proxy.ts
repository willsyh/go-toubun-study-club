import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/session";

const APP_PATHS = [
  "/",
  "/chat",
  "/notes",
  "/memory",
  "/account",
  "/characters",
  "/study",
  "/read",
  "/call",
  "/language",
  "/exams",
  "/exams/drill",
];
const AUTH_PATHS = ["/login", "/signup"];

/**
 * Optimistic redirects based on the signed session cookie. The real check
 * (user still exists, session not revoked) happens in /api/auth/me.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value) !== null;

  if (!signedIn && APP_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (signedIn && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat",
    "/notes",
    "/memory",
    "/account",
    "/characters",
    "/study",
    "/read",
    "/call",
    "/language",
    "/exams",
    "/exams/drill",
    "/login",
    "/signup",
  ],
};
