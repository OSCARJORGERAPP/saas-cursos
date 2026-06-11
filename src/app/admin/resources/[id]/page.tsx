import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getResourceById, listFeedback } from "@/lib/content";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { updateResourceAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const resource = await getResourceById(db, id);
  if (!resource) notFound();

  const feedback = await listFeedback(db, resource._id);

  return (
    <div>
      <Link
        href={`/admin/courses/${resource.courseId.toHexString()}`}
        className="text-sm text-indigo-600 hover:underline"
      >
        ← Volver al curso
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <form
          action={updateResourceAction}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="id" value={resource._id.toHexString()} />
          <label className="block text-sm font-medium text-slate-700">
            Título
            <input
              name="title"
              required
              defaultValue={resource.title}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Contenido (Markdown)
            <textarea
              name="content"
              rows={20}
              defaultValue={resource.content}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <button className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700">
            Guardar (actualiza la vista previa)
          </button>
        </form>

        {/* Vista previa */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Vista previa
          </h2>
          <h1 className="text-2xl font-bold">{resource.title}</h1>
          <div className="mt-4">
            <MarkdownRenderer content={resource.content} />
          </div>
        </div>
      </div>

      {/* Feedback recibido */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Feedback de students ({feedback.length})</h2>
        <ul className="mt-4 space-y-3">
          {feedback.map((f) => (
            <li
              key={f._id.toHexString()}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{f.userName}</span>
                <span className="text-slate-500">
                  {f.createdAt.toLocaleDateString("es-AR")}
                </span>
              </div>
              {f.rating !== null && (
                <div className="mt-1 text-sm text-amber-400">{"★".repeat(f.rating)}</div>
              )}
              <p className="mt-1 text-sm text-slate-700">{f.comment}</p>
            </li>
          ))}
          {feedback.length === 0 && (
            <p className="text-sm text-slate-500">Sin feedback todavía.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
