/**
 * Tests de integración contra MongoDB real (base saas-cursos-test).
 * Requiere mongod corriendo en localhost:27017.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Db, MongoClient, ObjectId } from "mongodb";
import {
  createMagicLink,
  consumeMagicLink,
  createSession,
  getUserBySessionToken,
  deleteSession,
  MAGIC_LINK_TTL_MS,
} from "@/lib/auth";
import {
  addFeedback,
  createCourse,
  createResource,
  createSection,
  deleteCourse,
  getCourseBySlug,
  listCourses,
  listFeedback,
  listResources,
  listSections,
  moveItem,
  renumberScope,
  updateCourse,
} from "@/lib/content";
import type { MagicLink, User } from "@/lib/types";

let client: MongoClient;
let db: Db;

beforeAll(async () => {
  client = new MongoClient(process.env.MONGODB_URI ?? "mongodb://localhost:27017");
  await client.connect();
  db = client.db("saas-cursos-test");
});

beforeEach(async () => {
  for (const c of ["users", "magic_links", "sessions", "courses", "sections", "resources", "feedback"]) {
    await db.collection(c).deleteMany({});
  }
});

afterAll(async () => {
  await db.dropDatabase();
  await client.close();
});

describe("auth: magic link", () => {
  it("crea usuario student y token al pedir magic link", async () => {
    const token = await createMagicLink(db, "Nuevo@Example.com");
    expect(token).toHaveLength(64);
    const user = await db.collection<User>("users").findOne({ email: "nuevo@example.com" });
    expect(user?.role).toBe("student");
    const link = await db.collection<MagicLink>("magic_links").findOne({ token });
    expect(link?.usedAt).toBeNull();
    expect(link!.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(link!.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + MAGIC_LINK_TTL_MS);
  });

  it("consume el token una sola vez", async () => {
    const token = await createMagicLink(db, "ana@example.com");
    const user = await consumeMagicLink(db, token);
    expect(user?.email).toBe("ana@example.com");
    // segundo uso falla
    expect(await consumeMagicLink(db, token)).toBeNull();
  });

  it("rechaza tokens expirados", async () => {
    const token = await createMagicLink(db, "ana@example.com");
    await db
      .collection("magic_links")
      .updateOne({ token }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await consumeMagicLink(db, token)).toBeNull();
  });

  it("no modifica el rol de un usuario existente", async () => {
    await db.collection("users").insertOne({
      _id: new ObjectId(),
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      createdAt: new Date(),
    });
    await createMagicLink(db, "admin@example.com");
    const user = await db.collection<User>("users").findOne({ email: "admin@example.com" });
    expect(user?.role).toBe("admin");
  });

  it("sesiones: crear, validar, eliminar", async () => {
    const token = await createMagicLink(db, "ana@example.com");
    const user = (await consumeMagicLink(db, token))!;
    const sessionToken = await createSession(db, user._id);
    const fromSession = await getUserBySessionToken(db, sessionToken);
    expect(fromSession?.email).toBe("ana@example.com");
    await deleteSession(db, sessionToken);
    expect(await getUserBySessionToken(db, sessionToken)).toBeNull();
  });
});

describe("contenidos: CRUD y orden", () => {
  it("crea cursos con orden creciente y solo lista publicados", async () => {
    const c1 = await createCourse(db, { title: "A", slug: "a", description: "" });
    const c2 = await createCourse(db, { title: "B", slug: "b", description: "" });
    expect(c2.order).toBeGreaterThan(c1.order);
    expect(await listCourses(db, true)).toHaveLength(0);
    await updateCourse(db, c1._id.toHexString(), { published: true });
    const published = await listCourses(db, true);
    expect(published.map((c) => c.slug)).toEqual(["a"]);
    expect((await listCourses(db, false)).length).toBe(2);
  });

  it("secciones y recursos mantienen secuencia por padre", async () => {
    const course = await createCourse(db, { title: "C", slug: "c", description: "" });
    const s1 = await createSection(db, course._id, "S1");
    const s2 = await createSection(db, course._id, "S2");
    await createResource(db, s1._id, course._id, { title: "R1", content: "" });
    await createResource(db, s1._id, course._id, { title: "R2", content: "" });
    await createResource(db, s2._id, course._id, { title: "R3", content: "" });

    const sections = await listSections(db, course._id);
    expect(sections.map((s) => s.title)).toEqual(["S1", "S2"]);
    expect((await listResources(db, s1._id)).map((r) => r.title)).toEqual(["R1", "R2"]);
    expect((await listResources(db, s2._id)).map((r) => r.title)).toEqual(["R3"]);
  });

  it("moveItem reordena secciones dentro de su curso", async () => {
    const course = await createCourse(db, { title: "C", slug: "c", description: "" });
    const s1 = await createSection(db, course._id, "S1");
    await createSection(db, course._id, "S2");
    const moved = await moveItem(db, "sections", s1._id.toHexString(), "down");
    expect(moved).toBe(true);
    expect((await listSections(db, course._id)).map((s) => s.title)).toEqual(["S2", "S1"]);
  });

  it("moveItem en el borde no hace nada", async () => {
    const course = await createCourse(db, { title: "C", slug: "c", description: "" });
    const s1 = await createSection(db, course._id, "S1");
    expect(await moveItem(db, "sections", s1._id.toHexString(), "up")).toBe(false);
  });

  it("renumberScope reasigna múltiplos de 1000 preservando el orden", async () => {
    const course = await createCourse(db, { title: "C", slug: "c", description: "" });
    const s1 = await createSection(db, course._id, "S1");
    const s2 = await createSection(db, course._id, "S2");
    // simular órdenes fraccionales agotados
    await db.collection("sections").updateOne({ _id: s1._id }, { $set: { order: 1.25 } });
    await db.collection("sections").updateOne({ _id: s2._id }, { $set: { order: 1.5 } });
    await renumberScope(db, "sections", { courseId: course._id });
    const sections = await listSections(db, course._id);
    expect(sections.map((s) => [s.title, s.order])).toEqual([
      ["S1", 1000],
      ["S2", 2000],
    ]);
  });

  it("deleteCourse elimina en cascada secciones, recursos y feedback", async () => {
    const course = await createCourse(db, { title: "C", slug: "c", description: "" });
    const s = await createSection(db, course._id, "S");
    const r = await createResource(db, s._id, course._id, { title: "R", content: "" });
    const userId = new ObjectId();
    await addFeedback(db, r._id, userId, { rating: 5, comment: "ok" });

    await deleteCourse(db, course._id.toHexString());
    expect(await getCourseBySlug(db, "c")).toBeNull();
    expect(await db.collection("sections").countDocuments()).toBe(0);
    expect(await db.collection("resources").countDocuments()).toBe(0);
    expect(await db.collection("feedback").countDocuments()).toBe(0);
  });
});

describe("feedback", () => {
  it("asocia feedback al recurso y al usuario con nombre", async () => {
    const course = await createCourse(db, { title: "C", slug: "c", description: "" });
    const s = await createSection(db, course._id, "S");
    const r = await createResource(db, s._id, course._id, { title: "R", content: "" });
    const user = {
      _id: new ObjectId(),
      email: "ana@example.com",
      name: "Ana",
      role: "student" as const,
      createdAt: new Date(),
    };
    await db.collection("users").insertOne(user);

    await addFeedback(db, r._id, user._id, { rating: 4, comment: "Muy bueno" });
    const list = await listFeedback(db, r._id);
    expect(list).toHaveLength(1);
    expect(list[0].userName).toBe("Ana");
    expect(list[0].rating).toBe(4);
    expect(list[0].resourceId.equals(r._id)).toBe(true);
  });
});
