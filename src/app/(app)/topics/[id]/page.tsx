"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Search,
  Bell,
  Share2,
  Plus,
  MoreVertical,
  Calendar,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesService } from "@/app/services/notes.service";
import { topicsService } from "@/app/services/topic.service";
import { Note } from "@/app/types/note.types";
import { TopicNode } from "@/app/types/topic.types";

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

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

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
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 ">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            placeholder="Search notes, tags, or topics..."
            className="w-full bg-slate-100  rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <Bell size={18} />
          </button>

          <button className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 ">
            <Share2 size={16} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Share
            </span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Topic Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              Project Folder
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900">
              {topicTitle}
            </h2>
            <p className="text-slate-500 mt-1">
              {notesLabel}
              {lastUpdatedLabel ? ` - ${lastUpdatedLabel}` : ""}
            </p>
          </div>

          <div className="flex gap-3">
            <button className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm">
              Filter
            </button>
            <button
              onClick={() => router.push(`/notes/new?topicId=${topicId}`)}
              className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Plus size={16} />
              New Note
            </button>
          </div>
        </div>

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

function NoteCard({
  tag,
  tagColor,
  title,
  description,
  date,
  isPinned,
  isPinLoading,
  isDeleteLoading,
  onTogglePin,
  onDelete,
  onClick,
}: {
  tag: string;
  tagColor: "amber" | "blue" | "slate";
  title: string;
  description: string;
  date: string;
  isPinned: boolean;
  isPinLoading: boolean;
  isDeleteLoading: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const tagStyles = {
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white  border border-slate-200  p-6 rounded-xl hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${tagStyles[tagColor]}`}
        >
          {tag}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin();
            }}
            disabled={isPinLoading}
            className={`p-1.5 rounded-lg border transition-colors ${
              isPinned
                ? "border-amber-200 text-amber-600 bg-amber-50"
                : "border-slate-200 text-slate-500 hover:text-primary hover:border-primary/40"
            } ${isPinLoading ? "opacity-60 cursor-wait" : ""}`}
            title={isPinned ? "Unpin note" : "Pin note"}
            aria-label={isPinned ? "Unpin note" : "Pin note"}
          >
            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            disabled={isDeleteLoading}
            className={`p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors ${
              isDeleteLoading ? "opacity-60 cursor-wait" : ""
            }`}
            title="Delete note"
            aria-label="Delete note"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors text-black">
        {title}
      </h3>

      <p className="text-slate-600  text-sm line-clamp-3 mb-4">{description}</p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 ">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Calendar size={14} />
          {date}
        </div>
      </div>
    </div>
  );
}

function NewNoteCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="border-2 border-dashed border-slate-200  p-6 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer min-h-55"
    >
      <div className="w-12 h-12 rounded-full bg-slate-100  flex items-center justify-center mb-3">
        <Plus />
      </div>
      <p className="font-bold text-sm">Create new note</p>
      <p className="text-xs text-slate-500 mt-1">
        or press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">N</kbd>
      </p>
    </div>
  );
}
