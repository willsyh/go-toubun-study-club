import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin, jsonError, readJson, setSessionCookie } from "@/lib/server/auth";
import { MIN_PASSWORD_LENGTH, hashPassword, sha256 } from "@/lib/server/password";
import { findUserByResetHash, updateUser } from "@/lib/server/users";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Bad origin.", 403);

  const body = await readJson<{ token: string; password: string }>(request);
  const token = String(body.token ?? "");
  const password = String(body.password ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 400);
  }
  if (password.length > 200) return jsonError("Password is too long.", 400);

  const user = token ? await findUserByResetHash(sha256(token)) : null;
  if (!user || !user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
    return jsonError("This reset link is invalid or has expired. Request a new one.", 400);
  }

  const updated = await updateUser(user.id, {
    passwordHash: await hashPassword(password),
    resetTokenHash: undefined,
    resetTokenExpires: undefined,
    bumpSessionVersion: true,
  });
  if (!updated) return jsonError("Account not found.", 404);
  return setSessionCookie(NextResponse.json({ ok: true }), updated, true);
}
