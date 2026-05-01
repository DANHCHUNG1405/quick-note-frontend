import { request } from "@/app/lib/api";
import type {
  CreateTodoPayload,
  PaginatedTodoResponse,
  Todo,
  TodoQueryParams,
  UpdateTodoPayload,
} from "@/app/types/todo.types";

const buildTodoQuery = (params: TodoQueryParams = {}): string => {
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

export const todoService = {
  list(params: TodoQueryParams = {}): Promise<PaginatedTodoResponse> {
    return request<PaginatedTodoResponse>(`/todos${buildTodoQuery(params)}`);
  },

  getById(todoId: string): Promise<Todo> {
    return request<Todo>(`/todos/${todoId}`);
  },

  create(payload: CreateTodoPayload): Promise<Todo> {
    return request<Todo>("/todos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(todoId: string, payload: UpdateTodoPayload): Promise<Todo> {
    return request<Todo>(`/todos/${todoId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remove(todoId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/todos/${todoId}`, {
      method: "DELETE",
    });
  },

  complete(todoId: string): Promise<Todo> {
    return request<Todo>(`/todos/${todoId}/complete`, {
      method: "PATCH",
    });
  },

  uncomplete(todoId: string): Promise<Todo> {
    return request<Todo>(`/todos/${todoId}/uncomplete`, {
      method: "PATCH",
    });
  },
};
