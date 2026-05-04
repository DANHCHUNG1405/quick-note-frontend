"use client";

import { Share2 } from "lucide-react";
import type { ReactNode } from "react";

type NoteTitleSectionProps = {
  title: string;
  onTitleChange: (value: string) => void;
  createdAtLabel: string;
  isCreateMode: boolean;
  wordCount: number;
  showShare: boolean;
  onShare: () => void;
  showSave: boolean;
  onSave: () => void;
  saveDisabled: boolean;
  saveLabel: string;
  viewersNode?: ReactNode;
};

export default function NoteTitleSection({
  title,
  onTitleChange,
  createdAtLabel,
  isCreateMode,
  wordCount,
  showShare,
  onShare,
  showSave,
  onSave,
  saveDisabled,
  saveLabel,
  viewersNode,
}: NoteTitleSectionProps) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          readOnly={!showSave}
          placeholder="Note Title"
          className={`w-full text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 mb-2 outline-none text-slate-900 ${
            showSave ? "" : "cursor-default"
          }`}
        />

        <div className="flex items-center gap-4 text-xs text-slate-500">
          {createdAtLabel && <span>{createdAtLabel}</span>}
          {!isCreateMode && (
            <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {viewersNode}
        {showShare && (
          <button
            onClick={onShare}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Share2 size={14} />
            Share
          </button>
        )}
        {showSave && (
          <button
            onClick={onSave}
            disabled={saveDisabled}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              saveDisabled
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-primary text-white border-primary hover:brightness-110"
            }`}
          >
            {saveLabel}
          </button>
        )}
      </div>
    </div>
  );
}
