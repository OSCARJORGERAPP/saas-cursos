import Link from "next/link";
import { getDb } from "@/lib/db";
import { listCourses } from "@/lib/content";
import {
  createCourseAction,
  deleteCourseAction,
  moveItemAction,
  togglePublishAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const db = await getDb();
  const courses = await listCourses(db, false);

  return (
    <div>
      <h1 className="text-3xl font-bold">Administración de cursos</h1>

      <form
        action={createCourseAction}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row"
      >
        <input
          name="title"
          required
          placeholder="Título del nuevo curso"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        />
        <input
          name="description"
          placeholder="Descripción breve"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        />
        <button className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700">
          Crear curso
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {courses.map((course, i) => (
          <li
            key={course._id.toHexString()}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/courses/${course._id.toHexString()}`}
                className="font-semibold hover:text-indigo-700"
              >
                {course.title}
              </Link>
              <p className="truncate text-sm text-slate-500">{course.description}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                course.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {course.published ? "Publicado" : "Borrador"}
            </span>

            <div className="flex items-center gap-1">
              {(["up", "down"] as const).map((dir) => (
                <form key={dir} action={moveItemAction}>
                  <input type="hidden" name="collection" value="courses" />
                  <input type="hidden" name="id" value={course._id.toHexString()} />
                  <input type="hidden" name="direction" value={dir} />
                  <input type="hidden" name="revalidate" value="/admin" />
                  <button
                    className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100"
                    title={dir === "up" ? "Subir" : "Bajar"}
                  >
                    {dir === "up" ? "↑" : "↓"}
                  </button>
                </form>
              ))}
              <form action={togglePublishAction}>
                <input type="hidden" name="id" value={course._id.toHexString()} />
                <input type="hidden" name="published" value={String(!course.published)} />
                <button className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100">
                  {course.published ? "Despublicar" : "Publicar"}
                </button>
              </form>
              <form action={deleteCourseAction}>
                <input type="hidden" name="id" value={course._id.toHexString()} />
                <button className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50">
                  Eliminar
                </button>
              </form>
            </div>
          </li>
        ))}
        {courses.length === 0 && <p className="text-slate-600">No hay cursos. Creá el primero.</p>}
      </ul>
    </div>
  );
}
