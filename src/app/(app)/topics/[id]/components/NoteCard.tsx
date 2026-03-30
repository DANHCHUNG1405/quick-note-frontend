"use client";

import { Calendar, Pin, PinOff, Trash2 } from "lucide-react";

type NoteCardProps = {
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
};

export default function NoteCard({
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
}: NoteCardProps) {
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
