export type TodoStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export type TodoPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type TodoDueFilter = "today" | "upcoming" | "overdue";

export type TodoGroupType = "CUSTOM" | "NOTE" | "DAILY" | "TOPIC";

export interface TodoGroupSummary {
  id: string;
  name: string;
  group_type: TodoGroupType;
  group_date: string | null;
}

export interface TodoGroup {
  id: string;
  user_id: string;
  topic_id: string | null;
  note_id: string | null;
  name: string;
  description: string | null;
  group_type: TodoGroupType;
  group_date: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  _count?: {
    todos?: number;
  };
  todos?: Todo[];
}

export interface Todo {
  id: string;
  user_id: string;
  topic_id: string | null;
  note_id: string | null;
  group_id?: string | null;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  due_at: string | null;
  completed_at: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  group?: TodoGroupSummary | null;
  todo_group?: TodoGroupSummary | null;
}

export interface CreateTodoPayload {
  title: string;
  description?: string | null;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_at?: string | null;
  topic_id?: string;
  note_id?: string;
  group_id?: string;
  groupId?: string;
  order_index?: number;
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string | null;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_at?: string | null;
  topic_id?: string;
  note_id?: string;
  group_id?: string | null;
  groupId?: string | null;
  order_index?: number;
}

export interface TodoQueryParams {
  status?: TodoStatus;
  priority?: TodoPriority;
  topicId?: string;
  noteId?: string;
  groupId?: string;
  due?: TodoDueFilter;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTodoResponse {
  items: Todo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTodoGroupPayload {
  name: string;
  description?: string | null;
  group_type?: TodoGroupType;
  group_date?: string | null;
  topic_id?: string;
  note_id?: string;
  order_index?: number;
}

export interface UpdateTodoGroupPayload {
  name?: string;
  description?: string | null;
  group_type?: TodoGroupType;
  group_date?: string | null;
  topic_id?: string;
  note_id?: string;
  order_index?: number;
}

export interface TodoGroupQueryParams {
  groupType?: TodoGroupType;
  topicId?: string;
  noteId?: string;
  groupDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTodoGroupResponse {
  items: TodoGroup[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
