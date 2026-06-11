import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { consumeMagicLink, createSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (!token) return NextResponse.redirect(`${appUrl}/login?error=token`);

  const db = await getDb();
  const user = await consumeMagicLink(db, token);
  if (!user) return NextResponse.redirect(`${appUrl}/login?error=invalid`);

  const sessionToken = await createSession(db, user._id);
  const dest = user.role === "admin" ? "/admin" : "/courses";
  const res = NextResponse.redirect(`${appUrl}${dest}`);
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: appUrl.startsWith("https://"),
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
  return res;
}
