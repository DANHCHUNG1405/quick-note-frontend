"use client";

import Link from "next/link";
import { CalendarDays, FolderKanban, NotebookText, Pencil, Tag, Trash2 } from "lucide-react";
import {
  formatDateOnly,
  getGroupTodoCount,
  TODO_GROUP_TYPE_LABELS,
} from "@/app/lib/todoUtils";
import type { TodoGroup } from "@/app/types/todo.types";

type TodoGroupCardProps = {
  group: TodoGroup;
  topicLabel?: string | null;
  editing: boolean;
  deleting: boolean;
  onEdit: (group: TodoGroup) => void;
  onDelete: (group: TodoGroup) => void;
};

const groupStyles = {
  CUSTOM: "bg-slate-100 text-slate-700",
  NOTE: "bg-blue-50 text-blue-700",
  DAILY: "bg-amber-50 text-amber-700",
  TOPIC: "bg-emerald-50 text-emerald-700",
};

export default function TodoGroupCard({
  group,
  topicLabel,
  editing,
  deleting,
  onEdit,
  onDelete,
}: TodoGroupCardProps) {
  const todoCount = getGroupTodoCount(group);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${groupStyles[group.group_type]}`}
            >
              <FolderKanban size={12} />
              {TODO_GROUP_TYPE_LABELS[group.group_type]}
            </span>

            {group.group_date && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                <CalendarDays size={12} />
                {formatDateOnly(group.group_date)}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {group.name}
          </h3>

          {group.description && (
            <p className="mt-2 text-sm text-slate-600">{group.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(group)}
            disabled={editing}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(group)}
            disabled={deleting}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
          <Tag size={12} />
          {todoCount} todos
        </span>

        {group.note_id && (
          <Link
            href={`/notes/${group.note_id}`}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <NotebookText size={12} />
            Open note
          </Link>
        )}

        {group.topic_id && (
          <Link
            href={`/topics/${group.topic_id}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary transition hover:bg-primary/15"
          >
            <NotebookText size={12} />
            {topicLabel || "Open topic"}
          </Link>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          Updated {formatDateOnly(group.updated_at || group.created_at)}
        </p>

        <Link
          href={`/todos/groups/${group.id}`}
          className="text-sm font-semibold text-primary transition hover:text-primary/80"
        >
          Open detail
        </Link>
      </div>
    </article>
  );
}
