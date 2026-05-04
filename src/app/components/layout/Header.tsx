"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/app/services/notifications.service";
import type {
  NotificationItem,
  NotificationSocketPayload,
} from "@/app/types/notification.types";
import { useNotificationsSocket } from "@/app/hooks/useNotificationsSocket";
import { useAuth } from "@/app/hooks/useAuth";

export default function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { user, isError } = useAuth();
  // Using isError boolean directly since useAuth manages errors internally.
  const error = isError ? "Failed to load user" : null;

  const notificationsQuery = useQuery<NotificationItem[], Error>({
    queryKey: ["notifications"],
    queryFn: () => notificationsService.list(),
  });

  useNotificationsSocket({
    onNotification: (payload: NotificationSocketPayload) => {
      const nextNotification: NotificationItem = {
        ...payload,
        is_read: payload.is_read ?? false,
        created_at: payload.created_at ?? null,
      };

      queryClient.setQueryData<NotificationItem[]>(
        ["notifications"],
        (current) => {
          const list = current ?? [];
          const existingIndex = list.findIndex(
            (item) => item.id === nextNotification.id,
          );

          if (existingIndex >= 0) {
            const nextList = [...list];
            nextList[existingIndex] = {
              ...nextList[existingIndex],
              ...nextNotification,
            };
            return nextList;
          }

          return [nextNotification, ...list];
        },
      );
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<NotificationItem[]>(
        ["notifications"],
        (current) =>
          current?.map((item) =>
            item.id === updated.id
              ? { ...item, ...updated, is_read: true }
              : item,
          ),
      );
    },
  });

  const displayName = useMemo(() => {
    if (!user) return error ? "Unknown user" : "Loading...";
    if (user.fullname?.trim()) return user.fullname.trim();
    if (user.userId?.trim()) return user.userId.trim();
    if (user.email?.trim()) return user.email.split("@")[0];
    return "Unknown user";
  }, [user, error]);

  const displayEmail = user?.email?.trim() || (error ? "No email" : "...");

  const initials = useMemo(() => {
    const source = displayName || displayEmail;
    const parts = source.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    const letters = parts.slice(0, 2).map((part) => part[0]);
    return letters.join("").toUpperCase();
  }, [displayName, displayEmail]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        notificationsRef.current &&
        target &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [notificationsOpen]);

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const unreadLabel = unreadCount > 99 ? "99+" : unreadCount.toString();

  const handleToggleNotifications = () => {
    setNotificationsOpen((open) => {
      const next = !open;
      if (next) {
        void notificationsQuery.refetch();
      }
      return next;
    });
  };

  const handleMarkRead = (notification: NotificationItem) => {
    if (notification.is_read) return;
    if (markReadMutation.isPending) return;
    markReadMutation.mutate(notification.id);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      <div className="flex-1" />

      <div className="flex items-center gap-4 ml-4">
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={handleToggleNotifications}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative"
            aria-haspopup="menu"
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 bg-red-500 text-[10px] font-semibold text-white rounded-full border-2 border-white flex items-center justify-center">
                {unreadLabel}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg py-2 z-10"
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Notifications
                </p>
              </div>

              {notificationsQuery.isLoading && (
                <div className="px-4 py-4 text-sm text-slate-500">
                  Loading notifications...
                </div>
              )}

              {!notificationsQuery.isLoading &&
                notificationsQuery.error && (
                  <div className="px-4 py-3 text-sm text-red-600">
                    {notificationsQuery.error.message}
                  </div>
                )}

              {!notificationsQuery.isLoading &&
                !notificationsQuery.error &&
                notifications.length === 0 && (
                  <div className="px-4 py-4 text-sm text-slate-500">
                    No notifications yet.
                  </div>
                )}

              {!notificationsQuery.isLoading &&
                !notificationsQuery.error &&
                notifications.length > 0 && (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleMarkRead(notification)}
                        className={`w-full text-left px-4 py-3 text-sm border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${
                          notification.is_read
                            ? "text-slate-600"
                            : "text-slate-900 bg-slate-50/60"
                        }`}
                      >
                        <p className="font-semibold text-sm">
                          {notification.title || "Notification"}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-slate-500 mt-1">
                            {notification.message}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-600">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-500">{displayEmail}</p>
          </div>

          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
