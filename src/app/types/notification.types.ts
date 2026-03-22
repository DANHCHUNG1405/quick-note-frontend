export interface NotificationItem {
  id: string;
  title?: string | null;
  message?: string | null;
  type?: string | null;
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
  data?: Record<string, unknown> | null;
}
