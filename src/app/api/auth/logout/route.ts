import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deleteSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await deleteSession(db, token);
  }
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const res = NextResponse.redirect(`${appUrl}/`, { status: 303 });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
