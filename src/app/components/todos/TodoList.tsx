"use client";

import type { Todo } from "@/app/types/todo.types";
import TodoItem from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  loading: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  topicLabels?: Record<string, string>;
  togglingTodoId?: string | null;
  editingTodoId?: string | null;
  deletingTodoId?: string | null;
  onToggleComplete: (todo: Todo, checked: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
};

export default function TodoList({
  todos,
  loading,
  error,
  emptyTitle = "Chưa có todo nào",
  emptyDescription = "Tạo todo đầu tiên để bắt đầu theo dõi công việc.",
  topicLabels = {},
  togglingTodoId,
  editingTodoId,
  deletingTodoId,
  onToggleComplete,
  onEdit,
  onDelete,
}: TodoListProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Đang tải danh sách todo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          topicLabel={todo.topic_id ? topicLabels[todo.topic_id] : null}
          toggling={togglingTodoId === todo.id}
          editing={editingTodoId === todo.id}
          deleting={deletingTodoId === todo.id}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
