import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlug, getResourceById, listFeedback } from "@/lib/content";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import FeedbackForm from "@/components/FeedbackForm";

export const dynamic = "force-dynamic";

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug, id } = await params;
  const db = await getDb();
  const course = await getCourseBySlug(db, slug);
  if (!course || (!course.published && user.role !== "admin")) notFound();

  const resource = await getResourceById(db, id);
  if (!resource || !resource.courseId.equals(course._id)) notFound();

  const feedback = await listFeedback(db, resource._id);

  return (
    <div>
      <Link href={`/courses/${course.slug}`} className="text-sm text-indigo-600 hover:underline">
        ← {course.title}
      </Link>
      <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">{resource.title}</h1>
        <div className="mt-6">
          <MarkdownRenderer content={resource.content} />
        </div>
      </article>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Feedback ({feedback.length})</h2>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FeedbackForm resourceId={resource._id.toHexString()} />
        </div>
        <ul className="mt-6 space-y-4">
          {feedback.map((f) => (
            <li
              key={f._id.toHexString()}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{f.userName}</span>
                <span className="text-xs text-slate-500">
                  {f.createdAt.toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {f.rating !== null && (
                <div className="mt-1 text-amber-400">
                  {"★".repeat(f.rating)}
                  <span className="text-slate-300">{"★".repeat(5 - f.rating)}</span>
                </div>
              )}
              <p className="mt-2 text-sm text-slate-700">{f.comment}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
