import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin, jsonError, readJson, setSessionCookie } from "@/lib/server/auth";
import { verifyPassword } from "@/lib/server/password";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { findUserByEmail, normalizeEmail, publicUser } from "@/lib/server/users";

type Body = { email: string; password: string; remember: boolean };

const INVALID = "Email or password is incorrect.";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Bad origin.", 403);

  const body = await readJson<Body>(request);
  const email = normalizeEmail(String(body.email ?? ""));
  const password = String(body.password ?? "");
  if (!email || !password) return jsonError("Enter your email and password.", 400);

  const ip = clientIp(request.headers);
  if (
    !rateLimit(`login:ip:${ip}`, 30, 15 * 60 * 1000) ||
    !rateLimit(`login:email:${email}`, 8, 15 * 60 * 1000)
  ) {
    return jsonError("Too many attempts. Wait a few minutes and try again.", 429);
  }

  const user = await findUserByEmail(email);
  if (!user) return jsonError(INVALID, 401);
  if (!user.passwordHash) {
    return jsonError("This account uses Google sign-in. Use “Continue with Google”.", 401);
  }
  if (!(await verifyPassword(password, user.passwordHash))) return jsonError(INVALID, 401);

  const response = NextResponse.json({ user: publicUser(user) });
  return setSessionCookie(response, user, body.remember !== false);
}
