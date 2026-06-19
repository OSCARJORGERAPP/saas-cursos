import { randomBytes } from "crypto";
import { Db, ObjectId } from "mongodb";
import type { MagicLink, Session, User } from "./types";

export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutos
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
export const SESSION_COOKIE = "session";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/** Crea (o reutiliza) el usuario como student y genera un magic link. */
export async function createMagicLink(db: Db, email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  await db.collection<User>("users").updateOne(
    { email: normalized },
    {
      $setOnInsert: {
        email: normalized,
        name: normalized.split("@")[0],
        role: "student",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  const token = generateToken();
  await db.collection<MagicLink>("magic_links").insertOne({
    _id: new ObjectId(),
    email: normalized,
    token,
    expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
    usedAt: null,
  });
  return token;
}

/** Valida y consume un magic link; devuelve el usuario o null. */
export async function consumeMagicLink(db: Db, token: string): Promise<User | null> {
  const link = await db.collection<MagicLink>("magic_links").findOneAndUpdate(
    { token, usedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date() } }
  );
  if (!link) return null;
  return db.collection<User>("users").findOne({ email: link.email });
}

export async function createSession(db: Db, userId: ObjectId): Promise<string> {
  const token = generateToken();
  await db.collection<Session>("sessions").insertOne({
    _id: new ObjectId(),
    userId,
    token,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export async function getUserBySessionToken(db: Db, token: string): Promise<User | null> {
  const session = await db
    .collection<Session>("sessions")
    .findOne({ token, expiresAt: { $gt: new Date() } });
  if (!session) return null;
  return db.collection<User>("users").findOne({ _id: session.userId });
}

export async function deleteSession(db: Db, token: string): Promise<void> {
  await db.collection<Session>("sessions").deleteOne({ token });
}
