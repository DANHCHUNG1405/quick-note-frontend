"use client";

import { FileText } from "lucide-react";

export default function SharedEmptyState() {
  return (
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
  );
}
