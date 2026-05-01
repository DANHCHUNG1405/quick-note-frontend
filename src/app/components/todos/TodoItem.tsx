"use client";

import Link from "next/link";
import { Calendar, CircleDashed, FolderKanban, NotebookPen, Pencil, Tag, Trash2 } from "lucide-react";
import {
  formatTodoDate,
  getTodoGroupSummary,
  isTodoCompleted,
  TODO_GROUP_TYPE_LABELS,
  TODO_PRIORITY_LABELS,
  TODO_STATUS_LABELS,
} from "@/app/lib/todoUtils";
import type { Todo } from "@/app/types/todo.types";

type TodoItemProps = {
  todo: Todo;
  topicLabel?: string | null;
  onToggleComplete: (todo: Todo, checked: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  toggling: boolean;
  editing: boolean;
  deleting: boolean;
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-50 text-blue-700",
  HIGH: "bg-amber-50 text-amber-700",
  URGENT: "bg-red-50 text-red-700",
};

const statusStyles = {
  PENDING: "bg-slate-100 text-slate-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-200 text-slate-600",
};

export default function TodoItem({
  todo,
  topicLabel,
  onToggleComplete,
  onEdit,
  onDelete,
  toggling,
  editing,
  deleting,
}: TodoItemProps) {
  const completed = isTodoCompleted(todo);
  const dueLabel = formatTodoDate(todo.due_at);
  const todoGroup = getTodoGroupSummary(todo);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={completed}
          disabled={toggling}
          onChange={(event) => onToggleComplete(todo, event.target.checked)}
          className="mt-1 h-5 w-5 rounded border-slate-300 accent-primary"
          aria-label={`Toggle todo ${todo.title}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h3
                className={`text-base font-semibold text-slate-900 ${
                  completed ? "line-through opacity-60" : ""
                }`}
              >
                {todo.title}
              </h3>

              {todo.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                  {todo.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(todo)}
                disabled={editing}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
              >
                <Pencil size={14} />
                Sửa
              </button>
              <button
                type="button"
                onClick={() => onDelete(todo)}
                disabled={deleting}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Xóa
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${priorityStyles[todo.priority]}`}
            >
              <Tag size={12} />
              {TODO_PRIORITY_LABELS[todo.priority]}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${statusStyles[todo.status]}`}
            >
              <CircleDashed size={12} />
              {TODO_STATUS_LABELS[todo.status]}
            </span>

            {dueLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                <Calendar size={12} />
                {dueLabel}
              </span>
            )}

            {todo.topic_id && (
              <Link
                href={`/topics/${todo.topic_id}`}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary transition hover:bg-primary/15"
              >
                <NotebookPen size={12} />
                {topicLabel || "Mở topic"}
              </Link>
            )}

            {todo.note_id && (
              <Link
                href={`/notes/${todo.note_id}`}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-200"
              >
                <NotebookPen size={12} />
                Mở note
              </Link>
            )}

            {todoGroup && (
              <Link
                href={`/todos/groups/${todoGroup.id}`}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                <FolderKanban size={12} />
                {todoGroup.name} · {TODO_GROUP_TYPE_LABELS[todoGroup.group_type]}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
