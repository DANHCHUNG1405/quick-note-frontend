"use client";

import { Share2, CheckCircle } from "lucide-react";

type NoteTitleSectionProps = {
  title: string;
  onTitleChange: (value: string) => void;
  createdAtLabel: string;
  isCreateMode: boolean;
  wordCount: number;
  showShare: boolean;
  onShare: () => void;
  showStatus: boolean;
  statusLabel: string;
  onSave: () => void;
  saveDisabled: boolean;
  saveLabel: string;
};

export default function NoteTitleSection({
  title,
  onTitleChange,
  createdAtLabel,
  isCreateMode,
  wordCount,
  showShare,
  onShare,
  showStatus,
  statusLabel,
  onSave,
  saveDisabled,
  saveLabel,
}: NoteTitleSectionProps) {
  return (
    <div className="mb-10 flex items-start justify-between">
      <div className="flex-1">
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Note Title"
          className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 mb-2 outline-none text-slate-900"
        />

        <div className="flex items-center gap-4 text-xs text-slate-500">
          {createdAtLabel && <span>{createdAtLabel}</span>}
          {!isCreateMode && (
            <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showShare && (
          <button
            onClick={onShare}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Share2 size={14} />
            Share
          </button>
        )}
        {showStatus && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-100">
            <CheckCircle size={14} />
            {statusLabel}
          </span>
        )}
        {showShare && (
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
