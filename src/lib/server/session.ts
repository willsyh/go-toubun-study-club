import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "gt_session";

const LONG_SESSION_SECONDS = 60 * 60 * 24 * 30; // "Remember me": 30 days
const SHORT_SESSION_SECONDS = 60 * 60 * 24; // browser session, hard cap 1 day

export type SessionPayload = {
  uid: string;
  /** Matches users.sessionVersion; bumping it signs the user out everywhere. */
  v: number;
  /** Expiry, seconds since epoch. */
  exp: number;
};

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (at least 32 characters) in production.");
  }
  return "dev-only-insecure-secret-change-me-please-0123456789";
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(uid: string, version: number, remember: boolean) {
  const maxAge = remember ? LONG_SESSION_SECONDS : SHORT_SESSION_SECONDS;
  const payload: SessionPayload = {
    uid,
    v: version,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${body}.${sign(body)}`, maxAge, remember };
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Cookie options. Without "remember me" the cookie has no maxAge, so it ends with the browser session. */
export function sessionCookieOptions(maxAge: number, remember: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge } : {}),
  };
}
