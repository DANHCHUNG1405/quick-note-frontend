"use client";

import { useEffect, useRef, useState } from "react";
import type { NotificationSocketPayload } from "@/app/types/notification.types";
import {
  acquireNotificationsSocket,
  releaseNotificationsSocket,
} from "@/app/lib/notificationsSocket";

export type SocketStatus = "idle" | "connecting" | "connected" | "disconnected";

type UseNotificationsSocketOptions = {
  token?: string | null;
  enabled?: boolean;
  onNotification?: (payload: NotificationSocketPayload) => void;
};

export const useNotificationsSocket = ({
  token,
  enabled = true,
  onNotification,
}: UseNotificationsSocketOptions) => {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const notificationRef = useRef(onNotification);

  useEffect(() => {
    notificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled) return;

    const socket = acquireNotificationsSocket(token);
    if (!socket) return;

    setStatus(socket.connected ? "connected" : "connecting");

    const handleConnect = () => {
      setStatus("connected");
      setError(null);
    };

    const handleDisconnect = () => {
      setStatus("disconnected");
    };

    const handleError = (err: Error) => {
      setError(err);
      setStatus("disconnected");
    };

    const handleNotification = (payload: NotificationSocketPayload) => {
      notificationRef.current?.(payload);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.off("notification", handleNotification);
      releaseNotificationsSocket();
    };
  }, [enabled, token]);

  return {
    status,
    error,
    connected: status === "connected",
  };
};
