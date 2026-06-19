"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import {
  createCourse,
  createResource,
  createSection,
  deleteCourse,
  deleteResource,
  deleteSection,
  moveItem,
  updateCourse,
  updateResource,
  updateSection,
} from "@/lib/content";

const objectId = z.string().refine(ObjectId.isValid, "id inválido");

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------- Cursos ----------

export async function createCourseAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({ title: z.string().trim().min(1), description: z.string().trim() })
    .parse({ title: formData.get("title"), description: formData.get("description") ?? "" });
  const db = await getDb();
  await createCourse(db, { ...data, slug: slugify(data.title) });
  revalidatePath("/admin");
}

export async function updateCourseAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({
      id: objectId,
      title: z.string().trim().min(1),
      description: z.string().trim(),
    })
    .parse({
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description") ?? "",
    });
  const db = await getDb();
  await updateCourse(db, data.id, {
    title: data.title,
    description: data.description,
    slug: slugify(data.title),
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${data.id}`);
}

export async function togglePublishAction(formData: FormData) {
  await requireAdmin();
  const id = objectId.parse(formData.get("id"));
  const published = formData.get("published") === "true";
  const db = await getDb();
  await updateCourse(db, id, { published });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin();
  const id = objectId.parse(formData.get("id"));
  const db = await getDb();
  await deleteCourse(db, id);
  revalidatePath("/admin");
}

// ---------- Secciones ----------

export async function createSectionAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({ courseId: objectId, title: z.string().trim().min(1) })
    .parse({ courseId: formData.get("courseId"), title: formData.get("title") });
  const db = await getDb();
  await createSection(db, new ObjectId(data.courseId), data.title);
  revalidatePath(`/admin/courses/${data.courseId}`);
}

export async function updateSectionAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({ id: objectId, courseId: objectId, title: z.string().trim().min(1) })
    .parse({
      id: formData.get("id"),
      courseId: formData.get("courseId"),
      title: formData.get("title"),
    });
  const db = await getDb();
  await updateSection(db, data.id, data.title);
  revalidatePath(`/admin/courses/${data.courseId}`);
}

export async function deleteSectionAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({ id: objectId, courseId: objectId })
    .parse({ id: formData.get("id"), courseId: formData.get("courseId") });
  const db = await getDb();
  await deleteSection(db, data.id);
  revalidatePath(`/admin/courses/${data.courseId}`);
}

// ---------- Recursos ----------

export async function createResourceAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({
      sectionId: objectId,
      courseId: objectId,
      title: z.string().trim().min(1),
    })
    .parse({
      sectionId: formData.get("sectionId"),
      courseId: formData.get("courseId"),
      title: formData.get("title"),
    });
  const db = await getDb();
  const resource = await createResource(
    db,
    new ObjectId(data.sectionId),
    new ObjectId(data.courseId),
    { title: data.title, content: `# ${data.title}\n\nContenido pendiente.` }
  );
  redirect(`/admin/resources/${resource._id.toHexString()}`);
}

export async function updateResourceAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({ id: objectId, title: z.string().trim().min(1), content: z.string() })
    .parse({
      id: formData.get("id"),
      title: formData.get("title"),
      content: formData.get("content") ?? "",
    });
  const db = await getDb();
  await updateResource(db, data.id, { title: data.title, content: data.content });
  revalidatePath(`/admin/resources/${data.id}`);
}

export async function deleteResourceAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({ id: objectId, courseId: objectId })
    .parse({ id: formData.get("id"), courseId: formData.get("courseId") });
  const db = await getDb();
  await deleteResource(db, data.id);
  revalidatePath(`/admin/courses/${data.courseId}`);
}

// ---------- Reordenamiento ----------

export async function moveItemAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({
      collection: z.enum(["courses", "sections", "resources"]),
      id: objectId,
      direction: z.enum(["up", "down"]),
      revalidate: z.string(),
    })
    .parse({
      collection: formData.get("collection"),
      id: formData.get("id"),
      direction: formData.get("direction"),
      revalidate: formData.get("revalidate") ?? "/admin",
    });
  const db = await getDb();
  await moveItem(db, data.collection, data.id, data.direction);
  revalidatePath(data.revalidate);
}
