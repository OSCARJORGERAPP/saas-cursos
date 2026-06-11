import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { listCourses } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const db = await getDb();
  const courses = await listCourses(db, true);

  return (
    <div>
      <h1 className="text-3xl font-bold">Cursos</h1>
      <p className="mt-1 text-slate-600">Seguí la secuencia numerada de estudio.</p>
      <div className="mt-8 space-y-4">
        {courses.map((course, i) => (
          <Link
            key={course._id.toHexString()}
            href={`/courses/${course.slug}`}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{course.description}</p>
            </div>
          </Link>
        ))}
        {courses.length === 0 && (
          <p className="text-slate-600">Todavía no hay cursos publicados.</p>
        )}
      </div>
    </div>
  );
}
