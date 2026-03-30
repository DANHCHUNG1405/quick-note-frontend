"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { notesService } from "@/app/services/notes.service";
import type { Note } from "@/app/types/note.types";
import SharedHeader from "./components/SharedHeader";
import SharedNoteCard from "./components/SharedNoteCard";
import SharedEmptyState from "./components/SharedEmptyState";

const previewFromHtml = (html: string | null) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export default function SharedNotesClient() {
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
      <SharedHeader notesLabel={notesLabel} />

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

      {!errorMessage && !isLoading && notes.length === 0 && <SharedEmptyState />}

      {!errorMessage && !isLoading && notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const preview = previewFromHtml(note.content);

            return (
              <SharedNoteCard
                key={note.id}
                title={note.title || "Untitled"}
                preview={preview || "No content"}
                updatedAt={note.updated_at}
                createdAt={note.created_at}
                onClick={() => router.push(`/notes/${note.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
