"use client";

import type { Todo } from "@/app/types/todo.types";
import TodoList from "./TodoList";

type TodoGroupTodosProps = {
  todos: Todo[];
  loading: boolean;
  error?: string | null;
  topicLabels?: Record<string, string>;
  togglingTodoId?: string | null;
  editingTodoId?: string | null;
  deletingTodoId?: string | null;
  onToggleComplete: (todo: Todo, checked: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
};

export default function TodoGroupTodos(props: TodoGroupTodosProps) {
  return (
    <TodoList
      {...props}
      emptyTitle="No todos in this group"
      emptyDescription="Add the first todo to start working inside this group."
    />
  );
}
