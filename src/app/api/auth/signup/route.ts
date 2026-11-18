import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin, jsonError, readJson, setSessionCookie } from "@/lib/server/auth";
import { MIN_PASSWORD_LENGTH, hashPassword } from "@/lib/server/password";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { EmailTakenError, createUser, isValidEmail, normalizeEmail, publicUser } from "@/lib/server/users";

type Body = { email: string; password: string; ageConfirmed: boolean; remember: boolean };

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Bad origin.", 403);
  if (!rateLimit(`signup:${clientIp(request.headers)}`, 10, 60 * 60 * 1000)) {
    return jsonError("Too many sign-ups from this network. Try again later.", 429);
  }

  const body = await readJson<Body>(request);
  const email = normalizeEmail(String(body.email ?? ""));
  const password = String(body.password ?? "");

  if (!isValidEmail(email)) return jsonError("Enter a valid email address.", 400);
  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 400);
  }
  if (password.length > 200) return jsonError("Password is too long.", 400);
  if (body.ageConfirmed !== true) return jsonError("You need to be 13 or older to sign up.", 400);

  try {
    const user = await createUser(email, await hashPassword(password));
    const response = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    return setSessionCookie(response, user, body.remember !== false);
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return jsonError("An account with this email already exists. Try signing in.", 409);
    }
    throw err;
  }
}
