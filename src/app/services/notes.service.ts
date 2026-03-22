import { request } from "@/app/lib/api";
import {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
  NoteShare,
  ShareNotePayload,
  UpdateSharePayload,
} from "@/app/types/note.types";

export const notesService = {
  /**
   * CREATE NOTE
   */
  create(payload: CreateNotePayload): Promise<Note> {
    return request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET NOTES BY TOPIC
   */
  getByTopic(topicId: string): Promise<Note[]> {
    return request<Note[]>(`/notes/topic/${topicId}`);
  },

  /**
   * GET NOTE BY ID
   */
  getById(noteId: string): Promise<Note> {
    return request<Note>(`/notes/${noteId}`);
  },

  /**
   * GET RECENT NOTES
   */
  getRecent(): Promise<Note[]> {
    return request<Note[]>("/notes/recent");
  },

  /**
   * GET NOTES SHARED WITH ME
   */
  getSharedWithMe(): Promise<Note[]> {
    return request<Note[]>("/notes/shared");
  },

  /**
   * UPDATE NOTE
   */
  update(noteId: string, payload: UpdateNotePayload): Promise<Note> {
    return request<Note>(`/notes/${noteId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * DELETE NOTE
   */
  delete(noteId: string): Promise<{ count: number }> {
    return request(`/notes/${noteId}`, {
      method: "DELETE",
    });
  },

  /**
   * PIN NOTE
   */
  pin(noteId: string): Promise<Note> {
    return request<Note>(`/notes/${noteId}/pin`, {
      method: "PATCH",
    });
  },

  /**
   * UNPIN NOTE
   */
  unpin(noteId: string): Promise<Note> {
    return request<Note>(`/notes/${noteId}/unpin`, {
      method: "PATCH",
    });
  },

  /**
   * LIST SHARES FOR A NOTE
   */
  listShares(noteId: string): Promise<NoteShare[]> {
    return request<NoteShare[]>(`/notes/${noteId}/shares`);
  },

  /**
   * SHARE NOTE WITH A USER
   */
  shareNote(noteId: string, payload: ShareNotePayload): Promise<NoteShare> {
    return request<NoteShare>(`/notes/${noteId}/share`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * UPDATE SHARE PERMISSION
   */
  updateSharePermission(
    noteId: string,
    shareUserId: string,
    payload: UpdateSharePayload,
  ): Promise<NoteShare> {
    return request<NoteShare>(`/notes/${noteId}/share/${shareUserId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * REMOVE SHARE
   */
  removeShare(noteId: string, shareUserId: string): Promise<{ count: number }> {
    return request<{ count: number }>(
      `/notes/${noteId}/share/${shareUserId}`,
      {
        method: "DELETE",
      },
    );
  },
};
