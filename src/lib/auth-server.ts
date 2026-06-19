/**
 * Funciones de autenticación que dependen de Next.js APIs (cookies, headers).
 * Se importan solo desde Server Components y Route Handlers.
 * Los tests importan desde auth.ts en su lugar.
 */
import { cookies } from "next/headers";
import { getDb } from "./db";
import { SESSION_COOKIE, getUserBySessionToken } from "./auth";
import type { User } from "./types";

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
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
