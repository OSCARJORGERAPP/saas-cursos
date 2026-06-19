import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { AuthError, requireUser } from "@/lib/auth-server";
import { addFeedback, getResourceById } from "@/lib/content";

const bodySchema = z.object({
  resourceId: z.string().refine(ObjectId.isValid, "id inválido"),
  rating: z.number().int().min(1).max(5).nullable(),
  comment: z.string().trim().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const db = await getDb();
    const resource = await getResourceById(db, parsed.data.resourceId);
    if (!resource) {
      return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
    }
    const feedback = await addFeedback(db, resource._id, user._id, {
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });
    return NextResponse.json({ ok: true, id: feedback._id.toHexString() });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
