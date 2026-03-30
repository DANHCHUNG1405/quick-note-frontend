"use client";

import { Share2 } from "lucide-react";

type SharedHeaderProps = {
  notesLabel: string;
};

export default function SharedHeader({ notesLabel }: SharedHeaderProps) {
  return (
    <header className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Share2 size={20} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Shared With You
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Shared Notes</h1>
          <p className="text-sm text-slate-500 mt-1">{notesLabel}</p>
        </div>
      </div>
    </header>
  );
}
