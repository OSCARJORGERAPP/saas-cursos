import { Db, ObjectId } from "mongodb";
import type { Course, Feedback, Resource, Section, User } from "./types";
import { ORDER_STEP, orderForAppend, swapWithNeighbor } from "./ordering";

// ---------- Cursos ----------

export async function listCourses(db: Db, onlyPublished: boolean): Promise<Course[]> {
  const filter = onlyPublished ? { published: true } : {};
  return db.collection<Course>("courses").find(filter).sort({ order: 1 }).toArray();
}

export async function getCourseBySlug(db: Db, slug: string): Promise<Course | null> {
  return db.collection<Course>("courses").findOne({ slug });
}

export async function getCourseById(db: Db, id: string): Promise<Course | null> {
  if (!ObjectId.isValid(id)) return null;
  return db.collection<Course>("courses").findOne({ _id: new ObjectId(id) });
}

export async function createCourse(
  db: Db,
  data: { title: string; slug: string; description: string }
): Promise<Course> {
  const orders = await db
    .collection<Course>("courses")
    .find({}, { projection: { order: 1 } })
    .map((c) => c.order)
    .toArray();
  const now = new Date();
  const course: Course = {
    _id: new ObjectId(),
    ...data,
    order: orderForAppend(orders),
    published: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.collection<Course>("courses").insertOne(course);
  return course;
}

export async function updateCourse(
  db: Db,
  id: string,
  data: Partial<Pick<Course, "title" | "slug" | "description" | "published">>
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const res = await db
    .collection<Course>("courses")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...data, updatedAt: new Date() } });
  return res.matchedCount === 1;
}

export async function deleteCourse(db: Db, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const courseId = new ObjectId(id);
  const resourceIds = await db
    .collection<Resource>("resources")
    .find({ courseId }, { projection: { _id: 1 } })
    .map((r) => r._id)
    .toArray();
  await db.collection("feedback").deleteMany({ resourceId: { $in: resourceIds } });
  await db.collection("resources").deleteMany({ courseId });
  await db.collection("sections").deleteMany({ courseId });
  const res = await db.collection("courses").deleteOne({ _id: courseId });
  return res.deletedCount === 1;
}

// ---------- Secciones ----------

export async function listSections(db: Db, courseId: ObjectId): Promise<Section[]> {
  return db.collection<Section>("sections").find({ courseId }).sort({ order: 1 }).toArray();
}

export async function createSection(db: Db, courseId: ObjectId, title: string): Promise<Section> {
  const orders = await db
    .collection<Section>("sections")
    .find({ courseId }, { projection: { order: 1 } })
    .map((s) => s.order)
    .toArray();
  const now = new Date();
  const section: Section = {
    _id: new ObjectId(),
    courseId,
    title,
    order: orderForAppend(orders),
    createdAt: now,
    updatedAt: now,
  };
  await db.collection<Section>("sections").insertOne(section);
  return section;
}

export async function updateSection(db: Db, id: string, title: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const res = await db
    .collection<Section>("sections")
    .updateOne({ _id: new ObjectId(id) }, { $set: { title, updatedAt: new Date() } });
  return res.matchedCount === 1;
}

export async function deleteSection(db: Db, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const sectionId = new ObjectId(id);
  const resourceIds = await db
    .collection<Resource>("resources")
    .find({ sectionId }, { projection: { _id: 1 } })
    .map((r) => r._id)
    .toArray();
  await db.collection("feedback").deleteMany({ resourceId: { $in: resourceIds } });
  await db.collection("resources").deleteMany({ sectionId });
  const res = await db.collection("sections").deleteOne({ _id: sectionId });
  return res.deletedCount === 1;
}

// ---------- Recursos ----------

export async function listResources(db: Db, sectionId: ObjectId): Promise<Resource[]> {
  return db.collection<Resource>("resources").find({ sectionId }).sort({ order: 1 }).toArray();
}

export async function getResourceById(db: Db, id: string): Promise<Resource | null> {
  if (!ObjectId.isValid(id)) return null;
  return db.collection<Resource>("resources").findOne({ _id: new ObjectId(id) });
}

export async function createResource(
  db: Db,
  sectionId: ObjectId,
  courseId: ObjectId,
  data: { title: string; content: string }
): Promise<Resource> {
  const orders = await db
    .collection<Resource>("resources")
    .find({ sectionId }, { projection: { order: 1 } })
    .map((r) => r.order)
    .toArray();
  const now = new Date();
  const resource: Resource = {
    _id: new ObjectId(),
    sectionId,
    courseId,
    ...data,
    order: orderForAppend(orders),
    createdAt: now,
    updatedAt: now,
  };
  await db.collection<Resource>("resources").insertOne(resource);
  return resource;
}

export async function updateResource(
  db: Db,
  id: string,
  data: Partial<Pick<Resource, "title" | "content">>
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const res = await db
    .collection<Resource>("resources")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...data, updatedAt: new Date() } });
  return res.matchedCount === 1;
}

export async function deleteResource(db: Db, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const resourceId = new ObjectId(id);
  await db.collection("feedback").deleteMany({ resourceId });
  const res = await db.collection("resources").deleteOne({ _id: resourceId });
  return res.deletedCount === 1;
}

// ---------- Reordenamiento genérico ----------

type Orderable = "courses" | "sections" | "resources";

/**
 * Mueve un elemento arriba/abajo dentro de su lista (mismo padre).
 * Intercambia los valores de `order` con el vecino.
 */
export async function moveItem(
  db: Db,
  collection: Orderable,
  id: string,
  direction: "up" | "down"
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const _id = new ObjectId(id);
  const coll = db.collection<{ _id: ObjectId; order: number }>(collection);
  const item = await coll.findOne({ _id });
  if (!item) return false;

  const scope =
    collection === "courses"
      ? {}
      : collection === "sections"
        ? { courseId: (item as unknown as Section).courseId }
        : { sectionId: (item as unknown as Resource).sectionId };

  const siblings = await coll.find(scope).sort({ order: 1 }).toArray();
  const index = siblings.findIndex((s) => s._id.equals(_id));
  const updates = swapWithNeighbor(
    siblings.map((s) => s.order),
    index,
    direction
  );
  if (updates.length === 0) return false;
  for (const [i, newOrder] of updates) {
    await coll.updateOne({ _id: siblings[i]._id }, { $set: { order: newOrder } });
  }
  return true;
}

/** Renumera toda una lista con múltiplos de ORDER_STEP (mantenimiento). */
export async function renumberScope(
  db: Db,
  collection: Orderable,
  scope: Record<string, ObjectId>
): Promise<void> {
  const coll = db.collection<{ _id: ObjectId; order: number }>(collection);
  const items = await coll.find(scope).sort({ order: 1 }).toArray();
  for (let i = 0; i < items.length; i++) {
    await coll.updateOne({ _id: items[i]._id }, { $set: { order: (i + 1) * ORDER_STEP } });
  }
}

// ---------- Feedback ----------

export async function listFeedback(
  db: Db,
  resourceId: ObjectId
): Promise<Array<Feedback & { userName: string }>> {
  const items = await db
    .collection<Feedback>("feedback")
    .find({ resourceId })
    .sort({ createdAt: -1 })
    .toArray();
  const userIds = [...new Set(items.map((f) => f.userId.toHexString()))].map(
    (s) => new ObjectId(s)
  );
  const users = await db
    .collection<User>("users")
    .find({ _id: { $in: userIds } })
    .toArray();
  const names = new Map(users.map((u) => [u._id.toHexString(), u.name]));
  return items.map((f) => ({ ...f, userName: names.get(f.userId.toHexString()) ?? "Anónimo" }));
}

export async function addFeedback(
  db: Db,
  resourceId: ObjectId,
  userId: ObjectId,
  data: { rating: number | null; comment: string }
): Promise<Feedback> {
  const feedback: Feedback = {
    _id: new ObjectId(),
    resourceId,
    userId,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date(),
  };
  await db.collection<Feedback>("feedback").insertOne(feedback);
  return feedback;
}
