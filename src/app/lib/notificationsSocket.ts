"use client";

import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";
import type { NotificationSocketPayload } from "@/app/types/notification.types";
import type {
  NotePresenceErrorPayload,
  NoteViewersUpdatePayload,
} from "@/app/types/note-presence.types";
import { getAccessToken } from "@/app/lib/authToken";

type ServerToClientEvents = {
  notification: (payload: NotificationSocketPayload) => void;
  "note:viewers:update": (payload: NoteViewersUpdatePayload) => void;
  "note:error": (payload: NotePresenceErrorPayload) => void;
};

type ClientToServerEvents = {
  "note:join": (payload: { noteId: string }) => void;
  "note:leave": (payload: { noteId: string }) => void;
};

type NotificationsSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const getDefaultSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return "http://localhost:8080/notifications";

  return `${apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "")}/notifications`;
};

const SOCKET_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_SOCKET_URL ??
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  getDefaultSocketUrl();

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
  if (!nextToken) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      ...DEFAULT_OPTIONS,
      auth: { token: nextToken },
    });
    currentToken = nextToken;
    return socket;
  }

  if (nextToken !== currentToken) {
    const shouldReconnect = socket.active || socket.connected;
    socket.auth = { token: nextToken };
    currentToken = nextToken;
    socket.disconnect();
    if (shouldReconnect) socket.connect();
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
