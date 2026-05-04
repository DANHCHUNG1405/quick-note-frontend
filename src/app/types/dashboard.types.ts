import type { TodoPriority, TodoStatus } from "@/app/types/todo.types";

export type DashboardRecentNote = {
  id: string;
  title: string;
  topic_id?: string | null;
  topicName?: string | null;
  topic_name?: string | null;
  topic?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  last_viewed_at?: string | null;
};

export type DashboardTodoItem = {
  id: string;
  title: string;
  status?: TodoStatus | string;
  priority?: TodoPriority | string;
  due_at?: string | null;
  dueAt?: string | null;
  topic_id?: string | null;
  note_id?: string | null;
};

export type DashboardStats = {
  generatedAt: string;
  overview: {
    topics: number;
    notes: number;
    pinnedNotes: number;
    sharedWithMe: number;
    sharedByMe: number;
    todoGroups: number;
    todos: number;
    pendingTodos: number;
    completedTodos: number;
    overdueTodos: number;
    unreadNotifications: number;
  };
  notes: {
    total: number;
    pinned: number;
    recentlyViewed: number;
    updatedLast7Days: number;
    sharedWithMe: number;
    sharedByMe: number;
  };
  todos: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    overdue: number;
    dueToday: number;
    upcoming: number;
    withoutDueDate: number;
    completionRate: number;
    byPriority: {
      LOW: number;
      NORMAL: number;
      HIGH: number;
      URGENT: number;
    };
  };
  todoGroups: {
    total: number;
    custom: number;
    note: number;
    daily: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
  activity: {
    recentNotes: DashboardRecentNote[];
    upcomingTodos: DashboardTodoItem[];
    overdueTodos: DashboardTodoItem[];
  };
};
