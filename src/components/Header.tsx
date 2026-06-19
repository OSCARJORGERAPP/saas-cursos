import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-server";

export default async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex flex-col items-center gap-3 px-4 pt-5 pb-3">
        <div className="flex items-center justify-center gap-6">
          <Image src="/images/OmniSys.png" alt="OmniSys" width={120} height={48} className="h-12 w-auto" priority />
          <Image src="/images/qr.png" alt="Código QR OmniSys" width={48} height={48} className="h-12 w-12" priority />
        </div>
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-indigo-600">Inicio</Link>
          {user && (
            <Link href="/courses" className="hover:text-indigo-600">Cursos</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="hover:text-indigo-600">Administración</Link>
          )}
          {user ? (
            <form action="/api/auth/logout" method="post" className="inline">
              <button className="text-slate-500 hover:text-indigo-600">
                Salir ({user.name})
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-700"
            >
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
