import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlug, listSections, listResources } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const db = await getDb();
  const course = await getCourseBySlug(db, slug);
  if (!course || (!course.published && user.role !== "admin")) notFound();

  const sections = await listSections(db, course._id);
  const sectionsWithResources = await Promise.all(
    sections.map(async (section) => ({
      section,
      resources: await listResources(db, section._id),
    }))
  );

  // Posición del curso entre los publicados para numeración visible
  const allCourses = await db
    .collection("courses")
    .find({ published: true })
    .sort({ order: 1 })
    .toArray();
  const courseNumber = allCourses.findIndex((c) => c._id.equals(course._id)) + 1;

  return (
    <div>
      <Link href="/courses" className="text-sm text-indigo-600 hover:underline">
        ← Volver a cursos
      </Link>
      <h1 className="mt-2 text-3xl font-bold">
        {courseNumber > 0 && <span className="text-indigo-600">{courseNumber}. </span>}
        {course.title}
      </h1>
      <p className="mt-2 text-slate-600">{course.description}</p>

      <div className="mt-8 space-y-8">
        {sectionsWithResources.map(({ section, resources }, si) => (
          <section key={section._id.toHexString()}>
            <h2 className="text-xl font-semibold">
              <span className="text-indigo-600">
                {courseNumber > 0 ? `${courseNumber}.` : ""}
                {si + 1}
              </span>{" "}
              {section.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {resources.map((resource, ri) => (
                <li key={resource._id.toHexString()}>
                  <Link
                    href={`/courses/${course.slug}/resources/${resource._id.toHexString()}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:border-indigo-300"
                  >
                    <span className="text-sm font-bold text-indigo-600">
                      {courseNumber > 0 ? `${courseNumber}.` : ""}
                      {si + 1}.{ri + 1}
                    </span>
                    <span className="font-medium">{resource.title}</span>
                  </Link>
                </li>
              ))}
              {resources.length === 0 && (
                <li className="text-sm text-slate-500">Sin recursos todavía.</li>
              )}
            </ul>
          </section>
        ))}
        {sections.length === 0 && <p className="text-slate-600">Este curso aún no tiene secciones.</p>}
      </div>
    </div>
  );
}
