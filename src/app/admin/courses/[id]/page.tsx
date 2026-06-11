import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCourseById, listResources, listSections } from "@/lib/content";
import {
  createResourceAction,
  createSectionAction,
  deleteResourceAction,
  deleteSectionAction,
  moveItemAction,
  updateCourseAction,
  updateSectionAction,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const course = await getCourseById(db, id);
  if (!course) notFound();

  const courseId = course._id.toHexString();
  const revalidate = `/admin/courses/${courseId}`;
  const sections = await listSections(db, course._id);
  const sectionsWithResources = await Promise.all(
    sections.map(async (s) => ({ section: s, resources: await listResources(db, s._id) }))
  );

  return (
    <div>
      <Link href="/admin" className="text-sm text-indigo-600 hover:underline">
        ← Administración
      </Link>

      {/* Edición del curso */}
      <form
        action={updateCourseAction}
        className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="id" value={courseId} />
        <label className="block text-sm font-medium text-slate-700">
          Título
          <input
            name="title"
            required
            defaultValue={course.title}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Descripción
          <textarea
            name="description"
            rows={2}
            defaultValue={course.description}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <button className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700">
          Guardar curso
        </button>
      </form>

      {/* Secciones */}
      <h2 className="mt-10 text-2xl font-bold">Secciones</h2>
      <form action={createSectionAction} className="mt-4 flex gap-3">
        <input type="hidden" name="courseId" value={courseId} />
        <input
          name="title"
          required
          placeholder="Título de la nueva sección"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        />
        <button className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700">
          Agregar sección
        </button>
      </form>

      <div className="mt-6 space-y-6">
        {sectionsWithResources.map(({ section, resources }, si) => {
          const sectionId = section._id.toHexString();
          return (
            <div
              key={sectionId}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-indigo-600">{si + 1}.</span>
                <form action={updateSectionAction} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={sectionId} />
                  <input type="hidden" name="courseId" value={courseId} />
                  <input
                    name="title"
                    required
                    defaultValue={section.title}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 focus:border-indigo-500 focus:outline-none"
                  />
                  <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                    Renombrar
                  </button>
                </form>
                {(["up", "down"] as const).map((dir) => (
                  <form key={dir} action={moveItemAction}>
                    <input type="hidden" name="collection" value="sections" />
                    <input type="hidden" name="id" value={sectionId} />
                    <input type="hidden" name="direction" value={dir} />
                    <input type="hidden" name="revalidate" value={revalidate} />
                    <button className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100">
                      {dir === "up" ? "↑" : "↓"}
                    </button>
                  </form>
                ))}
                <form action={deleteSectionAction}>
                  <input type="hidden" name="id" value={sectionId} />
                  <input type="hidden" name="courseId" value={courseId} />
                  <button className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50">
                    Eliminar
                  </button>
                </form>
              </div>

              {/* Recursos */}
              <ul className="mt-4 space-y-2">
                {resources.map((resource, ri) => (
                  <li
                    key={resource._id.toHexString()}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2"
                  >
                    <span className="text-sm font-bold text-indigo-600">
                      {si + 1}.{ri + 1}
                    </span>
                    <Link
                      href={`/admin/resources/${resource._id.toHexString()}`}
                      className="flex-1 font-medium hover:text-indigo-700"
                    >
                      {resource.title}
                    </Link>
                    {(["up", "down"] as const).map((dir) => (
                      <form key={dir} action={moveItemAction}>
                        <input type="hidden" name="collection" value="resources" />
                        <input type="hidden" name="id" value={resource._id.toHexString()} />
                        <input type="hidden" name="direction" value={dir} />
                        <input type="hidden" name="revalidate" value={revalidate} />
                        <button className="rounded px-2 py-0.5 text-slate-500 hover:bg-slate-200">
                          {dir === "up" ? "↑" : "↓"}
                        </button>
                      </form>
                    ))}
                    <form action={deleteResourceAction}>
                      <input type="hidden" name="id" value={resource._id.toHexString()} />
                      <input type="hidden" name="courseId" value={courseId} />
                      <button className="rounded px-2 py-0.5 text-sm text-red-600 hover:bg-red-50">
                        ✕
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
              <form action={createResourceAction} className="mt-3 flex gap-2">
                <input type="hidden" name="sectionId" value={sectionId} />
                <input type="hidden" name="courseId" value={courseId} />
                <input
                  name="title"
                  required
                  placeholder="Título del nuevo recurso"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <button className="rounded-lg border border-indigo-300 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
                  Agregar recurso
                </button>
              </form>
            </div>
          );
        })}
        {sections.length === 0 && (
          <p className="text-slate-600">Este curso no tiene secciones todavía.</p>
        )}
      </div>
    </div>
  );
}
