"use client";

import { AlertTriangle, ChevronRight, Save } from "lucide-react";

type UnsavedChangesDialogProps = {
  open: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

export default function UnsavedChangesDialog({
  open,
  saving,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_38%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
              <AlertTriangle size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
                Unsaved Changes
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Leave this note?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                You have edits that are not saved yet. Save now to keep your
                latest changes before moving away from this page.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3">
            <p className="text-sm font-medium text-slate-800">
              If you leave without saving, the current edits in this note will
              be lost.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex w-full items-center justify-between rounded-2xl bg-primary px-4 py-3.5 text-left text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Save size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {saving ? "Saving note..." : "Save and leave"}
                  </span>
                  <span className="block text-xs text-white/80">
                    Keep the latest content, then continue.
                  </span>
                </span>
              </span>
              {!saving && <ChevronRight size={18} className="text-white/80" />}
            </button>

            <button
              type="button"
              onClick={onDiscard}
              disabled={saving}
              className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-left text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              <span>
                <span className="block text-sm font-semibold">
                  Leave without saving
                </span>
                <span className="block text-xs text-red-600/80">
                  Discard current edits and exit this page.
                </span>
              </span>
              <ChevronRight size={18} className="text-red-500" />
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              Stay on this page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
