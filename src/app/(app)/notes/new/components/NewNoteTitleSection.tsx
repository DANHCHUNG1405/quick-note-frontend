"use client";

type NewNoteTitleSectionProps = {
  title: string;
  onTitleChange: (value: string) => void;
  topicId: string;
  wordCount: number;
  onSave: () => void;
  saveDisabled: boolean;
  saveLabel: string;
};

export default function NewNoteTitleSection({
  title,
  onTitleChange,
  topicId,
  wordCount,
  onSave,
  saveDisabled,
  saveLabel,
}: NewNoteTitleSectionProps) {
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
          {topicId ? (
            <span>Topic {topicId}</span>
          ) : (
            <span className="text-red-500">Missing topic</span>
          )}
          <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
      </div>
    </div>
  );
}
