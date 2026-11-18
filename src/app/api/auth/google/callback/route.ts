import { NextResponse, type NextRequest } from "next/server";
import { setSessionCookie } from "@/lib/server/auth";
import { GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/server/google";
import { upsertGoogleUser } from "@/lib/server/users";

type TokenResponse = { access_token?: string; error?: string };
type UserInfo = { sub?: string; email?: string; email_verified?: boolean };

export async function GET(request: NextRequest) {
  const [expectedState, rememberFlag, from = "/login"] =
    request.cookies.get(GOOGLE_STATE_COOKIE)?.value.split("|") ?? [];
  const fail = (code: string) => {
    const back = from === "/signup" ? "/signup" : "/login";
    const res = NextResponse.redirect(new URL(`${back}?error=${code}`, request.url));
    res.cookies.set(GOOGLE_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  };

  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  if (params.get("error") || !code) return fail("google_cancelled");
  if (!expectedState || params.get("state") !== expectedState) return fail("google_state");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: googleRedirectUri(request),
        grant_type: "authorization_code",
      }),
    });
    const tokens = (await tokenRes.json()) as TokenResponse;
    if (!tokenRes.ok || !tokens.access_token) return fail("google_failed");

    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const info = (await infoRes.json()) as UserInfo;
    if (!infoRes.ok || !info.sub || !info.email || info.email_verified === false) {
      return fail("google_failed");
    }

    const user = await upsertGoogleUser(info.sub, info.email);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(GOOGLE_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return setSessionCookie(response, user, rememberFlag !== "0");
  } catch (err) {
    console.error("[google sign-in]", err);
    return fail("google_failed");
  }
}
