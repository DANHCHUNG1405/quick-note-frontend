"use client";

import type { TodoGroup } from "@/app/types/todo.types";
import TodoGroupCard from "./TodoGroupCard";

type TodoGroupsListProps = {
  groups: TodoGroup[];
  loading: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  topicLabels?: Record<string, string>;
  editingGroupId?: string | null;
  deletingGroupId?: string | null;
  onEdit: (group: TodoGroup) => void;
  onDelete: (group: TodoGroup) => void;
};

export default function TodoGroupsList({
  groups,
  loading,
  error,
  emptyTitle = "No todo groups yet",
  emptyDescription = "Create a group to organize related todos together.",
  topicLabels = {},
  editingGroupId,
  deletingGroupId,
  onEdit,
  onDelete,
}: TodoGroupsListProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading todo groups...
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

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <TodoGroupCard
          key={group.id}
          group={group}
          topicLabel={group.topic_id ? topicLabels[group.topic_id] : null}
          editing={editingGroupId === group.id}
          deleting={deletingGroupId === group.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
