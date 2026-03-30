"use client";

import { Plus } from "lucide-react";

type TopicSummaryHeaderProps = {
  topicTitle: string;
  notesLabel: string;
  lastUpdatedLabel: string;
  onNewNote: () => void;
};

export default function TopicSummaryHeader({
  topicTitle,
  notesLabel,
  lastUpdatedLabel,
  onNewNote,
}: TopicSummaryHeaderProps) {
  return (
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
          onClick={onNewNote}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={16} />
          New Note
        </button>
      </div>
    </div>
  );
}
