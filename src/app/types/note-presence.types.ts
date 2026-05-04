export type NoteViewer = {
  id: string;
  name: string;
  avatarUrl?: string;
  color?: string;
};

export type NoteViewersUpdatePayload = {
  noteId: string;
  viewers: NoteViewer[];
};

export type NotePresenceErrorPayload = {
  event: "note:join" | "note:leave";
  noteId?: string;
  message: string;
};
