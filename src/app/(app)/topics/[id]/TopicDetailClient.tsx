"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesService } from "@/app/services/notes.service";
import { topicsService } from "@/app/services/topic.service";
import { Note } from "@/app/types/note.types";
import { TopicNode } from "@/app/types/topic.types";
import TopicHeaderBar from "./components/TopicHeaderBar";
import TopicSummaryHeader from "./components/TopicSummaryHeader";
import NoteCard from "./components/NoteCard";
import NewNoteCard from "./components/NewNoteCard";

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

type TopicDetailClientProps = {
  topicId: string;
};

export default function TopicDetailClient({
  topicId,
}: TopicDetailClientProps) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const topicQuery = useQuery<TopicNode, Error>({
    queryKey: ["topic", topicId],
    queryFn: () => topicsService.getById(topicId),
    enabled: !!topicId,
  });

  const notesQuery = useQuery<Note[], Error>({
    queryKey: ["notes", "topic", topicId],
    queryFn: () => notesService.getByTopic(topicId),
    enabled: !!topicId,
  });

  const togglePinMutation = useMutation<
    Note,
    Error,
    { id: string; isPinned: boolean }
  >({
    mutationFn: ({ id, isPinned }) =>
      isPinned ? notesService.unpin(id) : notesService.pin(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<Note[]>(
        ["notes", "topic", topicId],
        (current) => {
          if (!current) return current;
          return current.map((note) =>
            note.id === updated.id ? { ...note, ...updated } : note,
          );
        },
      );
      queryClient.setQueryData(["note", updated.id], updated);
    },
  });

  const deleteNoteMutation = useMutation<{ count: number }, Error, string>({
    mutationFn: (noteIdToDelete) => notesService.delete(noteIdToDelete),
    onSuccess: (_result, deletedId) => {
      queryClient.setQueryData<Note[]>(
        ["notes", "topic", topicId],
        (current) => current?.filter((note) => note.id !== deletedId) ?? [],
      );
      queryClient.removeQueries({ queryKey: ["note", deletedId] });
    },
  });

  const topicTitle = topicQuery.data?.name || "Untitled";
  const lastUpdatedLabel = topicQuery.data?.updated_at
    ? `Last updated ${formatDate(topicQuery.data.updated_at)}`
    : "";
  const notes = notesQuery.data ?? [];
  const isLoading = topicQuery.isLoading || notesQuery.isLoading;
  const errorMessage =
    topicQuery.error?.message || notesQuery.error?.message || null;

  const pinnedNotes = useMemo(
    () => notes.filter((note) => note.is_pinned),
    [notes],
  );
  const otherNotes = useMemo(
    () => notes.filter((note) => !note.is_pinned),
    [notes],
  );

  const notesLabel = useMemo(() => {
    if (isLoading) return "Loading notes";
    return `${notes.length} notes`;
  }, [isLoading, notes.length]);

  return (
    <div className="flex flex-col h-full bg-white ">
      <TopicHeaderBar />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <TopicSummaryHeader
          topicTitle={topicTitle}
          notesLabel={notesLabel}
          lastUpdatedLabel={lastUpdatedLabel}
          onNewNote={() => router.push(`/notes/new?topicId=${topicId}`)}
        />

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-100  mb-6">
          <button className="pb-4 border-b-2 border-primary text-primary font-bold text-sm">
            All Notes
          </button>
          <button className="pb-4 text-slate-500 text-sm">Trash</button>
        </div>

        {pinnedNotes.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Pinned
              </p>
              <span className="text-xs text-slate-500">
                {pinnedNotes.length} pinned
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedNotes.map((note) => {
                const preview = previewFromHtml(note.content);
                const dateLabel = formatDate(
                  note.updated_at || note.created_at,
                );
                const isPinLoading =
                  togglePinMutation.isPending &&
                  togglePinMutation.variables?.id === note.id;
                const isDeleteLoading =
                  deleteNoteMutation.isPending &&
                  deleteNoteMutation.variables === note.id;

                return (
                  <NoteCard
                    key={note.id}
                    tag="Pinned"
                    tagColor="amber"
                    title={note.title || "Untitled"}
                    description={preview || "No content"}
                    date={dateLabel}
                    isPinned
                    isPinLoading={isPinLoading}
                    isDeleteLoading={isDeleteLoading}
                    onTogglePin={() =>
                      togglePinMutation.mutate({
                        id: note.id,
                        isPinned: true,
                      })
                    }
                    onDelete={() => {
                      if (
                        !window.confirm(
                          "Are you sure you want to delete this note?",
                        )
                      ) {
                        return;
                      }
                      deleteNoteMutation.mutate(note.id);
                    }}
                    onClick={() => router.push(`/notes/${note.id}`)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherNotes.map((note) => {
            const preview = previewFromHtml(note.content);
            const dateLabel = formatDate(note.updated_at || note.created_at);
            const isPinLoading =
              togglePinMutation.isPending &&
              togglePinMutation.variables?.id === note.id;
            const isDeleteLoading =
              deleteNoteMutation.isPending &&
              deleteNoteMutation.variables === note.id;

            return (
              <NoteCard
                key={note.id}
                tag="Note"
                tagColor="slate"
                title={note.title || "Untitled"}
                description={preview || "No content"}
                date={dateLabel}
                isPinned={false}
                isPinLoading={isPinLoading}
                isDeleteLoading={isDeleteLoading}
                onTogglePin={() =>
                  togglePinMutation.mutate({
                    id: note.id,
                    isPinned: false,
                  })
                }
                onDelete={() => {
                  if (
                    !window.confirm(
                      "Are you sure you want to delete this note?",
                    )
                  ) {
                    return;
                  }
                  deleteNoteMutation.mutate(note.id);
                }}
                onClick={() => router.push(`/notes/${note.id}`)}
              />
            );
          })}

          {!isLoading && (
            <NewNoteCard
              onClick={() => router.push(`/notes/new?topicId=${topicId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
