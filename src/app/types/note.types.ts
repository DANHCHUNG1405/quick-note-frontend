export interface Note {
  id: string;
  topic_id: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotePayload {
  topic_id: string;
  title: string;
  content?: string;
  is_pinned?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  is_pinned?: boolean;
}
