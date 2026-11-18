import { NextResponse, type NextRequest } from "next/server";
import { GOOGLE_STATE_COOKIE, googleConfigured, googleRedirectUri } from "@/lib/server/google";
import { randomToken } from "@/lib/server/password";

/** Starts Google sign-in. Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. */
export function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const from = request.nextUrl.searchParams.get("from") === "signup" ? "/signup" : "/login";
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL(`${from}?error=google_not_configured`, request.url));
  }

  const state = randomToken();
  const remember = request.nextUrl.searchParams.get("remember") !== "0";
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email",
    state,
    prompt: "select_account",
  }).toString();

  const response = NextResponse.redirect(url);
  response.cookies.set(GOOGLE_STATE_COOKIE, `${state}|${remember ? 1 : 0}|${from}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
