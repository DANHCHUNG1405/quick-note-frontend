import { request } from "@/app/lib/api";
import type { NotificationItem } from "@/app/types/notification.types";

export const notificationsService = {
  /**
   * LIST NOTIFICATIONS
   */
  list(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>("/notifications");
  },

  /**
   * MARK NOTIFICATION AS READ
   */
  markRead(id: string): Promise<NotificationItem> {
    return request<NotificationItem>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },
};
