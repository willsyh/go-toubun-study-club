import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions, verifySessionToken } from "./session";
import { findUserById, type UserRecord } from "./users";

/** Full check for Route Handlers: valid signature, not expired, user exists, version matches. */
export async function getSessionUser(request: NextRequest): Promise<UserRecord | null> {
  const payload = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await findUserById(payload.uid);
  if (!user || user.sessionVersion !== payload.v) return null;
  return user;
}

export function setSessionCookie(response: NextResponse, user: UserRecord, remember: boolean) {
  const { token, maxAge } = createSessionToken(user.id, user.sessionVersion, remember);
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge, remember));
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Rejects cross-site form posts: the Origin header, when present, must match this host. */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export async function readJson<T>(request: NextRequest): Promise<Partial<T>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Partial<T>) : {};
  } catch {
    return {};
  }
}
