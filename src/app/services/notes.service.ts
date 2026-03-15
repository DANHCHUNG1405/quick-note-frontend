import { request } from "@/app/lib/api";
import {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
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
};
