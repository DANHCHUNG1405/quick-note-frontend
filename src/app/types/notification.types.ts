export interface NotificationItem {
  id: string;
  title?: string | null;
  message?: string | null;
  type?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
  updated_at?: string;
  data?: Record<string, unknown> | null;
  note_id?: string;
  shared_by_user_id?: string;
}

export interface NotificationSocketPayload {
  id: string;
  type: string;
  message: string;
  is_read: boolean | null;
  created_at: string | null;
  note_id: string;
  shared_by_user_id: string;
}
