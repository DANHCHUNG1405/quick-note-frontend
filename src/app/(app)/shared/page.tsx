"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText, Share2, Calendar } from "lucide-react";
import { notesService } from "@/app/services/notes.service";
import type { Note } from "@/app/types/note.types";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const previewFromHtml = (html: string | null) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export default function SharedNotesPage() {
  const router = useRouter();

  const sharedNotesQuery = useQuery<Note[], Error>({
    queryKey: ["notes", "shared"],
    queryFn: () => notesService.getSharedWithMe(),
  });

  const notes = sharedNotesQuery.data ?? [];
  const isLoading = sharedNotesQuery.isLoading;
  const errorMessage = sharedNotesQuery.error?.message || null;

  const notesLabel = useMemo(() => {
    if (isLoading) return "Loading notes";
    return `${notes.length} notes`;
  }, [isLoading, notes.length]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Share2 size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Shared With You
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Shared Notes
            </h1>
            <p className="text-sm text-slate-500 mt-1">{notesLabel}</p>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!errorMessage && isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading shared notes...
        </div>
      )}

      {!errorMessage && !isLoading && notes.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FileText size={20} />
          </div>
          <h2 className="mt-4 text-sm font-semibold text-slate-800">
            No shared notes yet
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Notes shared with you will show up here.
          </p>
        </div>
      )}

      {!errorMessage && !isLoading && notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const preview = previewFromHtml(note.content);
            const dateLabel = formatDate(note.updated_at || note.created_at);

            return (
              <button
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="group text-left bg-white border border-slate-200 p-6 rounded-xl hover:shadow-xl hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                    Shared
                  </span>
                  <FileText size={18} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors text-slate-900">
                  {note.title || "Untitled"}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                  {preview || "No content"}
                </p>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Calendar size={14} />
                  {dateLabel}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
