"use client";

type NoteFooterProps = {
  wordCount: number;
  charCount: number;
  lastSavedAt?: Date | null;
  showConnected?: boolean;
};

export default function NoteFooter({
  wordCount,
  charCount,
  lastSavedAt,
  showConnected = true,
}: NoteFooterProps) {
  return (
    <footer className="h-10 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-8 text-xs text-slate-600">
      <span>
        {wordCount} words - {charCount} characters
      </span>
      <span className="flex items-center gap-4">
        {lastSavedAt && (
          <span>
            Last saved{" "}
            {lastSavedAt.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        {showConnected && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Connected
          </span>
        )}
      </span>
    </footer>
  );
}
