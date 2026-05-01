"use client";

import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";
import type { NotificationSocketPayload } from "@/app/types/notification.types";
import { getAccessToken } from "@/app/lib/authToken";

type ServerToClientEvents = {
  notification: (payload: NotificationSocketPayload) => void;
};

type ClientToServerEvents = Record<string, never>;

type NotificationsSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_SOCKET_URL ??
  "http://localhost:3000/notifications";

const DEFAULT_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
  autoConnect: false,
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
};

let socket: NotificationsSocket | null = null;
let currentToken: string | null = null;
let refCount = 0;

const isBrowser = () => typeof window !== "undefined";

const ensureSocket = (token?: string | null): NotificationsSocket | null => {
  if (!isBrowser()) return null;

  const nextToken = token ?? getAccessToken();

  if (!socket) {
    socket = io(SOCKET_URL, {
      ...DEFAULT_OPTIONS,
      auth: nextToken ? { token: nextToken } : undefined,
    });
    currentToken = nextToken ?? null;
    return socket;
  }

  if (nextToken !== currentToken) {
    socket.auth = nextToken ? { token: nextToken } : {};
    currentToken = nextToken ?? null;
    if (socket.connected) {
      socket.disconnect();
    }
  }

  return socket;
};

export const acquireNotificationsSocket = (
  token?: string | null,
): NotificationsSocket | null => {
  const instance = ensureSocket(token);
  if (!instance) return null;

  refCount += 1;
  if (!instance.connected) {
    instance.connect();
  }

  return instance;
};

export const releaseNotificationsSocket = (): void => {
  if (!socket) return;
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    socket.disconnect();
  }
};

export const resetNotificationsSocket = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  currentToken = null;
  refCount = 0;
};
