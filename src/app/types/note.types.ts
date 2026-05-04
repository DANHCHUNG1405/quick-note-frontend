export interface Note {
  id: string;
  topic_id: string;
  user_id?: string;
  owner_id?: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  permission?: SharePermission | string | null;
  share_permission?: SharePermission | string | null;
  can_edit?: boolean;
  can_share?: boolean;
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

export type SharePermission = "view" | "edit";

export interface NoteShare {
  user_id: string;
  email?: string;
  name?: string;
  permission: SharePermission | string;
  created_at?: string;
  updated_at?: string;
}

export interface ShareNotePayload {
  email: string;
  permission: SharePermission;
}

export interface UpdateSharePayload {
  permission: SharePermission;
}
