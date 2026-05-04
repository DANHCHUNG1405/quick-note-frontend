"use client";

import { useEffect, useState } from "react";
import {
  acquireNotificationsSocket,
  releaseNotificationsSocket,
} from "@/app/lib/notificationsSocket";
import type {
  NotePresenceErrorPayload,
  NoteViewer,
  NoteViewersUpdatePayload,
} from "@/app/types/note-presence.types";

const dedupeViewers = (viewers: NoteViewer[]) => {
  const seen = new Set<string>();
  return viewers.filter((viewer) => {
    if (seen.has(viewer.id)) return false;
    seen.add(viewer.id);
    return true;
  });
};

export const useNoteViewers = (
  noteId: string | null | undefined,
  token?: string | null,
) => {
  const [viewers, setViewers] = useState<NoteViewer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) {
      setViewers([]);
      setError(null);
      return;
    }

    setViewers([]);
    setError(null);

    const socket = acquireNotificationsSocket(token);
    if (!socket) return;

    const joinNote = () => {
      socket.emit("note:join", { noteId });
    };

    const leaveNote = () => {
      socket.emit("note:leave", { noteId });
    };

    const handleViewersUpdate = (payload: NoteViewersUpdatePayload) => {
      if (payload.noteId !== noteId) return;
      setError(null);
      setViewers(dedupeViewers(payload.viewers));
    };

    const handleNoteError = (payload: NotePresenceErrorPayload) => {
      if (payload.noteId && payload.noteId !== noteId) return;
      setError(payload.message);
      if (payload.event === "note:join") {
        setViewers([]);
      }
    };

    const handleBeforeUnload = () => {
      leaveNote();
    };

    socket.on("note:viewers:update", handleViewersUpdate);
    socket.on("note:error", handleNoteError);
    socket.on("connect", joinNote);
    window.addEventListener("beforeunload", handleBeforeUnload);

    if (socket.connected) {
      joinNote();
    }

    return () => {
      leaveNote();
      socket.off("note:viewers:update", handleViewersUpdate);
      socket.off("note:error", handleNoteError);
      socket.off("connect", joinNote);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      releaseNotificationsSocket();
    };
  }, [noteId, token]);

  return {
    viewers,
    error,
  };
};
