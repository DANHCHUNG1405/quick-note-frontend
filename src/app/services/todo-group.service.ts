import { request } from "@/app/lib/api";
import type {
  CreateTodoGroupPayload,
  CreateTodoPayload,
  PaginatedTodoGroupResponse,
  PaginatedTodoResponse,
  Todo,
  TodoGroup,
  TodoGroupQueryParams,
  TodoQueryParams,
  UpdateTodoGroupPayload,
} from "@/app/types/todo.types";

const buildQuery = (
  params: Record<string, string | number | undefined | null>,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const todoGroupService = {
  getTodoGroups(params: TodoGroupQueryParams = {}): Promise<PaginatedTodoGroupResponse> {
    return request<PaginatedTodoGroupResponse>(
      `/todo-groups${buildQuery(params)}`,
    );
  },

  getTodoGroup(id: string): Promise<TodoGroup> {
    return request<TodoGroup>(`/todo-groups/${id}`);
  },

  createTodoGroup(payload: CreateTodoGroupPayload): Promise<TodoGroup> {
    return request<TodoGroup>("/todo-groups", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateTodoGroup(
    id: string,
    payload: UpdateTodoGroupPayload,
  ): Promise<TodoGroup> {
    return request<TodoGroup>(`/todo-groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteTodoGroup(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/todo-groups/${id}`, {
      method: "DELETE",
    });
  },

  getTodosByGroup(
    id: string,
    params: TodoQueryParams = {},
  ): Promise<PaginatedTodoResponse> {
    return request<PaginatedTodoResponse>(
      `/todo-groups/${id}/todos${buildQuery(params)}`,
    );
  },

  createTodoInGroup(id: string, payload: CreateTodoPayload): Promise<Todo> {
    return request<Todo>(`/todo-groups/${id}/todos`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
