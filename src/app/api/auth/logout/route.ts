import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie, isSameOrigin, jsonError } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Bad origin.", 403);
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
