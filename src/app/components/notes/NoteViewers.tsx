"use client";

import { useMemo, useRef, useState } from "react";
import type { NoteViewer } from "@/app/types/note-presence.types";

type NoteViewersProps = {
  viewers: NoteViewer[];
  currentUserId?: string | null;
  error?: string | null;
  maxVisible?: number;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const fallbackColor = (viewer: NoteViewer) => viewer.color || "#64748b";

export default function NoteViewers({
  viewers,
  currentUserId,
  error,
  maxVisible = 4,
}: NoteViewersProps) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dedupedViewers = useMemo(() => {
    const seen = new Set<string>();
    return viewers.filter((viewer) => {
      if (seen.has(viewer.id)) return false;
      seen.add(viewer.id);
      return true;
    });
  }, [viewers]);

  const visibleViewers = dedupedViewers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, dedupedViewers.length - visibleViewers.length);

  const handleOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  };

  const handleClose = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  };

  if (dedupedViewers.length === 0 && !error) return null;

  return (
    <div
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center pl-2"
        aria-label="View note viewers"
        aria-expanded={open}
      >
        <div className="flex -space-x-2">
          {visibleViewers.length > 0 ? (
            <>
              {visibleViewers.map((viewer) => (
                <Avatar
                  key={viewer.id}
                  viewer={viewer}
                  isCurrentUser={viewer.id === currentUserId}
                />
              ))}
              {hiddenCount > 0 && (
                <span className="flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 px-2 text-xs font-semibold text-slate-600 shadow-sm">
                  +{hiddenCount}
                </span>
              )}
            </>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-50 text-xs font-semibold text-red-600 shadow-sm">
              !
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-30 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Viewing now
          </div>
          {error && (
            <div className="mx-2 mb-1 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-600">
              {error}
            </div>
          )}
          <div className="max-h-72 overflow-y-auto">
            {dedupedViewers.map((viewer) => (
              <div
                key={viewer.id}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-slate-700"
              >
                <Avatar
                  viewer={viewer}
                  isCurrentUser={viewer.id === currentUserId}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900">
                    {viewer.name || "Unknown user"}
                    {viewer.id === currentUserId && (
                      <span className="ml-1 font-normal text-slate-500">
                        (You)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type AvatarProps = {
  viewer: NoteViewer;
  isCurrentUser: boolean;
  size?: "sm" | "md";
};

function Avatar({ viewer, isCurrentUser, size = "md" }: AvatarProps) {
  const dimensionClass = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";
  const title = isCurrentUser ? `${viewer.name || "You"} (You)` : viewer.name;

  if (viewer.avatarUrl) {
    return (
      <span
        role="img"
        aria-label={title || "Viewer avatar"}
        title={title}
        className={`${dimensionClass} rounded-full border-2 border-white bg-cover bg-center shadow-sm`}
        style={{ backgroundImage: `url("${viewer.avatarUrl}")` }}
      />
    );
  }

  return (
    <span
      title={title}
      className={`${dimensionClass} flex items-center justify-center rounded-full border-2 border-white font-semibold text-white shadow-sm`}
      style={{ backgroundColor: fallbackColor(viewer) }}
    >
      {getInitials(viewer.name || "Unknown user")}
    </span>
  );
}
