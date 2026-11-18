import type { NextRequest } from "next/server";

export const GOOGLE_STATE_COOKIE = "gt_google_state";

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(request: NextRequest) {
  const origin = process.env.APP_URL ?? request.nextUrl.origin;
  return `${origin}/api/auth/google/callback`;
}
