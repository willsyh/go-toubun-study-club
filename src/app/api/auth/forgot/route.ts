import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin, jsonError, readJson } from "@/lib/server/auth";
import { randomToken, sha256 } from "@/lib/server/password";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { findUserByEmail, normalizeEmail, updateUser } from "@/lib/server/users";

const RESET_TTL_MS = 30 * 60 * 1000;

/**
 * Creates a password-reset link. No email service is wired up yet, so the link
 * is printed to the server console. Plug a mailer in where marked below.
 * The response is the same whether or not the email exists.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Bad origin.", 403);
  if (!rateLimit(`forgot:${clientIp(request.headers)}`, 5, 15 * 60 * 1000)) {
    return jsonError("Too many requests. Try again in a few minutes.", 429);
  }

  const { email } = await readJson<{ email: string }>(request);
  const user = await findUserByEmail(normalizeEmail(String(email ?? "")));

  if (user) {
    const token = randomToken();
    await updateUser(user.id, {
      resetTokenHash: sha256(token),
      resetTokenExpires: Date.now() + RESET_TTL_MS,
    });
    const origin = process.env.APP_URL ?? request.nextUrl.origin;
    const link = `${origin}/reset-password?token=${token}`;
    // TODO: send `link` by email (Resend, SendGrid, SMTP...). Until then:
    console.info(`[password reset] ${user.email}: ${link}`);
  }

  return NextResponse.json({ ok: true });
}
