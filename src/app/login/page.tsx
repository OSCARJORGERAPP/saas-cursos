"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Ingresar</h1>
      <p className="mt-2 text-sm text-slate-600">
        Te enviamos un enlace mágico por email. Sin contraseñas.
      </p>

      {urlError && status === "idle" && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          El enlace es inválido o expiró. Pedí uno nuevo.
        </p>
      )}

      {status === "sent" ? (
        <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          <p className="font-semibold">¡Enlace enviado!</p>
          <p className="mt-1">
            Revisá tu bandeja de entrada
            {process.env.NODE_ENV !== "production" && (
              <>
                {" "}
                (en desarrollo:{" "}
                <a href="http://localhost:8025" target="_blank" className="underline">
                  MailHog
                </a>
                )
              </>
            )}
            .
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          {status === "error" && (
            <p className="text-sm text-red-600">No se pudo enviar el enlace. Intentá de nuevo.</p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {status === "sending" ? "Enviando…" : "Enviarme el enlace"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
