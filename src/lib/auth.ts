import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { Db, ObjectId } from "mongodb";
import { getDb } from "./db";
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

/** Usuario actual a partir de la cookie de sesión (server-side). */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  return getUserBySessionToken(db, token);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "No autenticado");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") throw new AuthError(403, "Requiere rol admin");
  return user;
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
