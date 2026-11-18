import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie, getSessionUser, isSameOrigin, jsonError } from "@/lib/server/auth";
import { deleteUser, publicUser } from "@/lib/server/users";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return clearSessionCookie(NextResponse.json({ error: "Not signed in." }, { status: 401 }));
  return NextResponse.json({ user: publicUser(user) }, { headers: { "Cache-Control": "no-store" } });
}

/** Deletes the account. Chats and notes live in the browser and are cleared by the client. */
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Bad origin.", 403);
  const user = await getSessionUser(request);
  if (!user) return jsonError("Not signed in.", 401);
  await deleteUser(user.id);
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
