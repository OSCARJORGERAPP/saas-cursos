import Link from "next/link";
import { getDb } from "@/lib/db";
import { listCourses } from "@/lib/content";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const db = await getDb();
  const [courses, user] = await Promise.all([listCourses(db, true), getCurrentUser()]);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-8 py-16 text-center text-white shadow-xl">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Aprendé a tu ritmo con cursos curados por expertos
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
          Contenidos en Markdown con videos, PDFs y recursos prácticos, organizados en una
          secuencia de estudio clara y numerada.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href={user ? "/courses" : "/login"}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow hover:bg-indigo-50"
          >
            {user ? "Ir a mis cursos" : "Comenzar ahora"}
          </Link>
        </div>
      </section>

      {/* Propuesta de valor */}
      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Secuencia de estudio",
            desc: "Cursos, secciones y recursos numerados para que siempre sepas qué sigue.",
            icon: "📚",
          },
          {
            title: "Contenido multimedia",
            desc: "Markdown enriquecido con videos de YouTube, PDFs e imágenes integradas.",
            icon: "🎬",
          },
          {
            title: "Feedback directo",
            desc: "Dejá tu opinión en cada recurso y ayudá a mejorar el contenido.",
            icon: "💬",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Cursos destacados */}
      <section>
        <h2 className="text-2xl font-bold">Cursos disponibles</h2>
        {courses.length === 0 ? (
          <p className="mt-4 text-slate-600">Pronto habrá cursos publicados.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <Link
                key={course._id.toHexString()}
                href={user ? `/courses/${course.slug}` : "/login"}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold group-hover:text-indigo-700">
                  {course.title}
                </h3>
                <p className="mt-1 line-clamp-3 text-sm text-slate-600">{course.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
