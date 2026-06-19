import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getResourceById, listFeedback } from "@/lib/content";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ResourceEditor from "@/components/ResourceEditor";
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

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ResourceEditor
          resourceId={resource._id.toHexString()}
          initialTitle={resource.title}
          initialContent={resource.content}
          action={updateResourceAction}
          preview={
            <div>
              <h1 className="text-2xl font-bold mb-4">{resource.title}</h1>
              <MarkdownRenderer content={resource.content} />
            </div>
          }
        />
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
