import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser, isSameOrigin, jsonError, readJson, setSessionCookie } from "@/lib/server/auth";
import { MIN_PASSWORD_LENGTH, hashPassword, verifyPassword } from "@/lib/server/password";
import { updateUser } from "@/lib/server/users";

type Body = { currentPassword: string; newPassword: string };

/** Changes (or, for Google-only accounts, sets) the password and signs out other devices. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Bad origin.", 403);
  const user = await getSessionUser(request);
  if (!user) return jsonError("Not signed in.", 401);

  const body = await readJson<Body>(request);
  const next = String(body.newPassword ?? "");
  if (next.length < MIN_PASSWORD_LENGTH) {
    return jsonError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 400);
  }
  if (next.length > 200) return jsonError("Password is too long.", 400);
  if (user.passwordHash && !(await verifyPassword(String(body.currentPassword ?? ""), user.passwordHash))) {
    return jsonError("Current password is incorrect.", 400);
  }

  const updated = await updateUser(user.id, {
    passwordHash: await hashPassword(next),
    bumpSessionVersion: true,
  });
  if (!updated) return jsonError("Account not found.", 404);
  return setSessionCookie(NextResponse.json({ ok: true }), updated, true);
}
