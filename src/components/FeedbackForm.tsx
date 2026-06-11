"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackForm({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId, rating, comment }),
    });
    if (res.ok) {
      setComment("");
      setRating(null);
      setStatus("idle");
      router.refresh();
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            onClick={() => setRating(rating === n ? null : n)}
            className={`text-2xl transition ${
              rating !== null && n <= rating ? "text-amber-400" : "text-slate-300"
            } hover:scale-110`}
            title={`${n} estrella${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
        {rating !== null && <span className="ml-2 text-sm text-slate-500">{rating}/5</span>}
      </div>
      <textarea
        required
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Dejá tu comentario sobre este recurso…"
        rows={3}
        maxLength={2000}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      {status === "error" && (
        <p className="text-sm text-red-600">No se pudo enviar el feedback. Intentá de nuevo.</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {status === "sending" ? "Enviando…" : "Enviar feedback"}
      </button>
    </form>
  );
}
