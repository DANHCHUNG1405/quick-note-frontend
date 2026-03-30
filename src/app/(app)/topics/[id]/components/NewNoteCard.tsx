"use client";

import { Plus } from "lucide-react";

type NewNoteCardProps = {
  onClick: () => void;
};

export default function NewNoteCard({ onClick }: NewNoteCardProps) {
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
