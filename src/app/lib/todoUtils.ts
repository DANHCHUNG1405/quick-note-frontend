import type {
  CreateTodoGroupPayload,
  CreateTodoPayload,
  Todo,
  TodoGroup,
  TodoGroupType,
  TodoPriority,
  TodoStatus,
  UpdateTodoGroupPayload,
  UpdateTodoPayload,
} from "@/app/types/todo.types";

export const TODO_PRIORITIES: TodoPriority[] = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
];

export const TODO_STATUSES: TodoStatus[] = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
];

export const TODO_GROUP_TYPES: TodoGroupType[] = [
  "CUSTOM",
  "NOTE",
  "DAILY",
  "TOPIC",
];

export const TODO_PRIORITY_LABELS: Record<TodoPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const TODO_GROUP_TYPE_LABELS: Record<TodoGroupType, string> = {
  CUSTOM: "Custom",
  NOTE: "Note",
  DAILY: "Daily",
  TOPIC: "Topic",
};

export const formatTodoDate = (value?: string | null): string => {
  if (!value) return "";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateOnly = (value?: string | null): string => {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTodoDateInput = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
};

export const todayDateInput = (): string => {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

export const toIsoOrNull = (value: string): string | null => {
  if (!value.trim()) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export const buildTodoPayload = (
  values: {
    title: string;
    description: string;
    due_at: string;
    priority: TodoPriority;
    status?: TodoStatus;
    topic_id?: string;
    note_id?: string;
    group_id?: string;
  },
  mode: "create" | "update",
): CreateTodoPayload | UpdateTodoPayload => {
  const payload: CreateTodoPayload | UpdateTodoPayload = {
    title: values.title.trim(),
    description: values.description.trim() ? values.description.trim() : null,
    due_at: toIsoOrNull(values.due_at),
    priority: values.priority,
  };

  if (values.status) {
    payload.status = values.status;
  }

  if (mode === "create" && values.topic_id?.trim()) {
    payload.topic_id = values.topic_id.trim();
  }

  if (mode === "create" && values.note_id?.trim()) {
    payload.note_id = values.note_id.trim();
  }

  if (values.group_id?.trim()) {
    payload.group_id = values.group_id.trim();
    payload.groupId = values.group_id.trim();
  } else if (mode === "update") {
    payload.group_id = null;
    payload.groupId = null;
  }

  if (mode === "update" && !values.due_at.trim()) {
    payload.due_at = null;
  }

  return payload;
};

export const buildTodoGroupPayload = (
  values: {
    name: string;
    description: string;
    group_type: TodoGroupType;
    group_date: string;
    topic_id: string;
    note_id: string;
    order_index: string;
  },
  mode: "create" | "update",
): CreateTodoGroupPayload | UpdateTodoGroupPayload => {
  const payload: CreateTodoGroupPayload | UpdateTodoGroupPayload = {
    name: values.name.trim(),
    description: values.description.trim() ? values.description.trim() : null,
    group_type: values.group_type,
  };

  if (values.group_date.trim()) {
    payload.group_date = values.group_date.trim();
  } else if (mode === "update") {
    payload.group_date = null;
  }

  if (values.topic_id.trim()) {
    payload.topic_id = values.topic_id.trim();
  }

  if (values.note_id.trim()) {
    payload.note_id = values.note_id.trim();
  }

  if (values.order_index.trim()) {
    payload.order_index = Number(values.order_index);
  }

  return payload;
};

export const isTodoCompleted = (todo: Todo): boolean =>
  todo.status === "COMPLETED";

export const getTodoGroupSummary = (
  todo: Todo,
): Todo["group"] | Todo["todo_group"] | null =>
  todo.group ?? todo.todo_group ?? null;

export const getGroupTodoCount = (group: TodoGroup): number =>
  group._count?.todos ?? group.todos?.length ?? 0;
