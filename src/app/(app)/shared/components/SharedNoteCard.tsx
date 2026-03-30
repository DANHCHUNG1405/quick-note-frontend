"use client";

import { FileText, Calendar } from "lucide-react";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type SharedNoteCardProps = {
  title: string;
  preview: string;
  updatedAt?: string | null;
  createdAt?: string | null;
  onClick: () => void;
};

export default function SharedNoteCard({
  title,
  preview,
  updatedAt,
  createdAt,
  onClick,
}: SharedNoteCardProps) {
  const dateLabel = formatDate(updatedAt || createdAt);

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border border-slate-200 p-6 rounded-xl hover:shadow-xl hover:border-primary/30 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
          Shared
        </span>
        <FileText size={18} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors text-slate-900">
        {title || "Untitled"}
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
}
