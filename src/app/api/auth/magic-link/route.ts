import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { createMagicLink } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/mailer";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  const db = await getDb();
  const token = await createMagicLink(db, parsed.data.email);
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  await sendMagicLinkEmail(parsed.data.email, `${appUrl}/auth/verify?token=${token}`);
  return NextResponse.json({ ok: true });
}
