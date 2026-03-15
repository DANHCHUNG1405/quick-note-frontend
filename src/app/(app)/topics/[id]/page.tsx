"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Bell,
  Share2,
  Plus,
  MoreVertical,
  Calendar,
} from "lucide-react";
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

  const [topic, setTopic] = useState<TopicNode | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicId) return;

    let isActive = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      topicsService.getById(topicId),
      notesService.getByTopic(topicId),
    ])
      .then(([topicData, notesData]) => {
        if (!isActive) return;
        setTopic(topicData);
        setNotes(notesData);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err?.message || "Failed to load topic");
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [topicId]);

  const topicTitle = topic?.name || "Untitled";
  const lastUpdatedLabel = topic?.updated_at
    ? `Last updated ${formatDate(topic.updated_at)}`
    : "";

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

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-100  mb-6">
          <button className="pb-4 border-b-2 border-primary text-primary font-bold text-sm">
            All Notes
          </button>
          <button className="pb-4 text-slate-500 text-sm">Recent</button>
          <button className="pb-4 text-slate-500 text-sm">Archived</button>
          <button className="pb-4 text-slate-500 text-sm">Trash</button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const preview = previewFromHtml(note.content);
            const dateLabel = formatDate(note.updated_at || note.created_at);
            const tag = note.is_pinned ? "Pinned" : "Note";
            const tagColor = note.is_pinned ? "amber" : "slate";

            return (
              <NoteCard
                key={note.id}
                tag={tag}
                tagColor={tagColor}
                title={note.title || "Untitled"}
                description={preview || "No content"}
                date={dateLabel}
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
  onClick,
}: {
  tag: string;
  tagColor: "amber" | "blue" | "slate";
  title: string;
  description: string;
  date: string;
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
        <button className="text-slate-400 hover:text-primary">
          <MoreVertical size={18} />
        </button>
      </div>

      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors text-black">
        {title}
      </h3>

      <p className="text-slate-600  text-sm line-clamp-3 mb-4">
        {description}
      </p>

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
