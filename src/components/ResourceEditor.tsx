"use client";

import { useState, useRef } from "react";
import {
  insertYoutubeEmbed,
  insertGoogleDocsEmbed,
  insertGoogleSheetsEmbed,
  insertGoogleSlidesEmbed,
  insertPdfEmbed,
  insertImageEmbed,
  insertCodeBlock,
  insertQuote,
  insertTable,
} from "@/lib/markdown-helpers";

interface ResourceEditorProps {
  resourceId: string;
  initialTitle: string;
  initialContent: string;
  action: (formData: FormData) => Promise<void>;
  preview: React.ReactNode;
}

export default function ResourceEditor({
  resourceId,
  initialTitle,
  initialContent,
  action,
  preview,
}: ResourceEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = before + text + "\n" + after;
    setContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          start + text.length + 1;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleYoutubePrompt = () => {
    const url = prompt("Pega la URL del video de YouTube:");
    if (url) insertAtCursor(insertYoutubeEmbed(url));
  };

  const handleGoogleDocsPrompt = () => {
    const id = prompt("ID del documento (extrae de la URL: /document/d/[ID]/edit):");
    if (id) insertAtCursor(insertGoogleDocsEmbed(id));
  };

  const handleGoogleSheetsPrompt = () => {
    const id = prompt("ID del sheet (extrae de la URL: /spreadsheets/d/[ID]/edit):");
    if (id) insertAtCursor(insertGoogleSheetsEmbed(id));
  };

  const handleGoogleSlidesPrompt = () => {
    const id = prompt("ID de la presentación (extrae de la URL: /presentation/d/[ID]/edit):");
    if (id) insertAtCursor(insertGoogleSlidesEmbed(id));
  };

  const handlePdfPrompt = () => {
    const url = prompt("URL del PDF:");
    if (url) insertAtCursor(insertPdfEmbed(url));
  };

  const handleImagePrompt = () => {
    const url = prompt("URL de la imagen:");
    if (url) {
      const alt = prompt("Texto alternativo (descripción):", "Imagen");
      insertAtCursor(insertImageEmbed(url, alt || "Imagen"));
    }
  };

  const handleCodePrompt = () => {
    const language = prompt("Lenguaje (js, python, html, etc):", "text");
    const code = prompt("Código:");
    if (code) insertAtCursor(insertCodeBlock(code, language || "text"));
  };

  const handleQuotePrompt = () => {
    const text = prompt("Texto para citar:");
    if (text) insertAtCursor(insertQuote(text));
  };

  const handleTablePrompt = () => {
    const rowsStr = prompt("Número de filas:", "3");
    const colsStr = prompt("Número de columnas:", "3");
    const rows = parseInt(rowsStr || "3");
    const cols = parseInt(colsStr || "3");
    if (rows > 0 && cols > 0) insertAtCursor(insertTable(rows, cols));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", resourceId);
      formData.append("title", title);
      formData.append("content", content);
      await action(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Barra de herramientas */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
          Insertar contenido
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          <button
            type="button"
            onClick={handleYoutubePrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar video de YouTube"
          >
            <span>▶️</span>
            <span className="hidden sm:inline">YouTube</span>
          </button>
          <button
            type="button"
            onClick={handleGoogleDocsPrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar Google Doc"
          >
            <span>📄</span>
            <span className="hidden sm:inline">Doc</span>
          </button>
          <button
            type="button"
            onClick={handleGoogleSheetsPrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar Google Sheet"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Sheet</span>
          </button>
          <button
            type="button"
            onClick={handleGoogleSlidesPrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar Google Slides"
          >
            <span>🎬</span>
            <span className="hidden sm:inline">Slides</span>
          </button>
          <button
            type="button"
            onClick={handlePdfPrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar PDF"
          >
            <span>📕</span>
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            type="button"
            onClick={handleImagePrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar imagen"
          >
            <span>🖼️</span>
            <span className="hidden sm:inline">Imagen</span>
          </button>
          <button
            type="button"
            onClick={handleCodePrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar bloque de código"
          >
            <span>{'</>'}</span>
            <span className="hidden sm:inline">Código</span>
          </button>
          <button
            type="button"
            onClick={handleQuotePrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar cita"
          >
            <span>💬</span>
            <span className="hidden sm:inline">Cita</span>
          </button>
          <button
            type="button"
            onClick={handleTablePrompt}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            title="Insertar tabla"
          >
            <span>📋</span>
            <span className="hidden sm:inline">Tabla</span>
          </button>
        </div>
      </div>

      {/* Editor / Preview toggle */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "editor"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "preview"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Vista previa
        </button>
      </div>

      {/* Editor / Preview content */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {activeTab === "editor" && (
          <textarea
            ref={textareaRef}
            rows={25}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe el contenido en Markdown. Usa los botones arriba para insertar videos, imágenes, etc."
            className="w-full p-4 font-mono text-sm focus:outline-none resize-none"
          />
        )}
        {activeTab === "preview" && (
          <div className="p-6 prose-custom max-h-screen overflow-y-auto">{preview}</div>
        )}
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Guardando..." : "Guardar recurso"}
      </button>

      {/* Help text */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
        <p className="font-semibold mb-1">💡 Consejos:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Los botones insertan sintaxis Markdown automáticamente</li>
          <li>
            Puedes editar directamente en Markdown si prefieres (ej:{" "}
            <code className="bg-white px-1">[Título](url)</code>)
          </li>
          <li>Los videos de YouTube se incrustan automáticamente</li>
        </ul>
      </div>
    </form>
  );
}
