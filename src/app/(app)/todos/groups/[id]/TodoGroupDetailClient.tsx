"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import TodoForm from "@/app/components/todos/TodoForm";
import TodoGroupForm from "@/app/components/todos/TodoGroupForm";
import TodoGroupTodos from "@/app/components/todos/TodoGroupTodos";
import { formatDateOnly, TODO_GROUP_TYPE_LABELS } from "@/app/lib/todoUtils";
import { todoGroupService } from "@/app/services/todo-group.service";
import { todoService } from "@/app/services/todo.service";
import { topicsService } from "@/app/services/topic.service";
import type { TopicNode } from "@/app/types/topic.types";
import type {
  CreateTodoPayload,
  PaginatedTodoResponse,
  Todo,
  TodoGroup,
  UpdateTodoGroupPayload,
  UpdateTodoPayload,
} from "@/app/types/todo.types";

const buildTopicLabelMap = (nodes: TopicNode[]): Record<string, string> => {
  const labels: Record<string, string> = {};
  const walk = (items: TopicNode[], parentPath = "") => {
    items.forEach((item) => {
      const label = parentPath ? `${parentPath} / ${item.name}` : item.name;
      labels[item.id] = label;
      if (item.children.length) {
        walk(item.children, label);
      }
    });
  };
  walk(nodes);
  return labels;
};

export default function TodoGroupDetailClient({ groupId }: { groupId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [todoFormMode, setTodoFormMode] = useState<"create" | "edit">("create");
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [todoFormError, setTodoFormError] = useState<string | null>(null);
  const [groupFormError, setGroupFormError] = useState<string | null>(null);

  const groupQuery = useQuery<TodoGroup, Error>({
    queryKey: ["todo-groups", "detail", groupId],
    queryFn: () => todoGroupService.getTodoGroup(groupId),
    enabled: !!groupId,
  });

  const todosQuery = useQuery<PaginatedTodoResponse, Error>({
    queryKey: ["todo-groups", "detail", groupId, "todos"],
    queryFn: () => todoGroupService.getTodosByGroup(groupId, { page: 1, limit: 100 }),
    enabled: !!groupId,
  });

  const topicsQuery = useQuery<TopicNode[], Error>({
    queryKey: ["topics", "tree"],
    queryFn: () => topicsService.getTree(),
  });

  const topicLabels = useMemo(
    () => buildTopicLabelMap(topicsQuery.data ?? []),
    [topicsQuery.data],
  );

  const refreshGroupData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["todo-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["todos"] }),
    ]);
  };

  const createTodoMutation = useMutation<Todo, Error, CreateTodoPayload>({
    mutationFn: (payload) => todoGroupService.createTodoInGroup(groupId, payload),
    onSuccess: async () => {
      await refreshGroupData();
      setTodoFormOpen(false);
      setTodoFormError(null);
      setActionMessage("Todo added to group successfully.");
    },
    onError: (error) => {
      setTodoFormError(error.message);
      setActionMessage("Failed to add todo to group.");
    },
  });

  const updateTodoMutation = useMutation<
    Todo,
    Error,
    { id: string; payload: UpdateTodoPayload }
  >({
    mutationFn: ({ id, payload }) => todoService.update(id, payload),
    onSuccess: async () => {
      await refreshGroupData();
      setTodoFormOpen(false);
      setSelectedTodo(null);
      setTodoFormError(null);
      setActionMessage("Todo updated successfully.");
    },
    onError: (error) => {
      setTodoFormError(error.message);
      setActionMessage("Failed to update todo.");
    },
  });

  const deleteTodoMutation = useMutation<{ message: string }, Error, string>({
    mutationFn: (todoId) => todoService.remove(todoId),
    onSuccess: async () => {
      await refreshGroupData();
      setActionMessage("Todo deleted successfully.");
    },
  });

  const toggleTodoMutation = useMutation<Todo, Error, { todo: Todo; checked: boolean }>({
    mutationFn: ({ todo, checked }) =>
      checked ? todoService.complete(todo.id) : todoService.uncomplete(todo.id),
    onSuccess: async (updated) => {
      await refreshGroupData();
      setActionMessage(
        updated.status === "COMPLETED"
          ? "Todo marked as completed."
          : "Todo moved back to pending.",
      );
    },
  });

  const updateGroupMutation = useMutation<
    TodoGroup,
    Error,
    UpdateTodoGroupPayload
  >({
    mutationFn: (payload) => todoGroupService.updateTodoGroup(groupId, payload),
    onSuccess: async () => {
      await refreshGroupData();
      setGroupFormOpen(false);
      setGroupFormError(null);
      setActionMessage("Todo group updated successfully.");
    },
    onError: (error) => {
      setGroupFormError(error.message);
      setActionMessage("Failed to update todo group.");
    },
  });

  const deleteGroupMutation = useMutation<{ message: string }, Error, void>({
    mutationFn: () => todoGroupService.deleteTodoGroup(groupId),
    onSuccess: async () => {
      await refreshGroupData();
      router.push("/todos");
    },
  });

  if (groupQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading todo group...
      </div>
    );
  }

  if (groupQuery.error || !groupQuery.data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {groupQuery.error?.message || "Todo group not found."}
      </div>
    );
  }

  const group = groupQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {TODO_GROUP_TYPE_LABELS[group.group_type]}
              </span>
              {group.group_date && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {formatDateOnly(group.group_date)}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
              {group.description && (
                <p className="mt-2 text-sm text-slate-600">{group.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {group.topic_id && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  Topic: {topicLabels[group.topic_id] || group.topic_id}
                </span>
              )}
              {group.note_id && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  Note linked
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setTodoFormMode("create");
                setSelectedTodo(null);
                setTodoFormError(null);
                setTodoFormOpen(true);
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Add todo
            </button>
            <button
              type="button"
              onClick={() => setGroupFormOpen(true)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Edit group
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    "Delete this group? Todos inside it will remain as standalone todos.",
                  )
                ) {
                  return;
                }
                deleteGroupMutation.mutate();
              }}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete group
            </button>
          </div>
        </div>
      </section>

      {actionMessage && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {actionMessage}
        </div>
      )}

      <TodoGroupTodos
        todos={todosQuery.data?.items ?? []}
        loading={todosQuery.isLoading}
        error={todosQuery.error?.message ?? null}
        topicLabels={topicLabels}
        togglingTodoId={toggleTodoMutation.variables?.todo.id ?? null}
        editingTodoId={
          updateTodoMutation.isPending ? updateTodoMutation.variables?.id ?? null : null
        }
        deletingTodoId={
          deleteTodoMutation.isPending ? deleteTodoMutation.variables ?? null : null
        }
        onToggleComplete={(todo, checked) =>
          toggleTodoMutation.mutate({ todo, checked })
        }
        onEdit={(todo) => {
          setTodoFormMode("edit");
          setSelectedTodo(todo);
          setTodoFormError(null);
          setTodoFormOpen(true);
        }}
        onDelete={(todo) => {
          if (!window.confirm("Delete this todo?")) {
            return;
          }
          deleteTodoMutation.mutate(todo.id);
        }}
      />

      <TodoForm
        open={todoFormOpen}
        mode={todoFormMode}
        initialTodo={selectedTodo}
        defaultTopicId={group.topic_id}
        defaultNoteId={group.note_id}
        defaultGroupId={group.id}
        lockTopicId={!!group.topic_id}
        lockNoteId={!!group.note_id}
        lockGroupId
        allowGroupSelection={false}
        submitError={todoFormError}
        submitting={createTodoMutation.isPending || updateTodoMutation.isPending}
        onClose={() => {
          setTodoFormOpen(false);
          setSelectedTodo(null);
          setTodoFormError(null);
        }}
        onSubmit={async (payload) => {
          if (todoFormMode === "create") {
            await createTodoMutation.mutateAsync(payload as CreateTodoPayload);
            return;
          }

          if (!selectedTodo) return;

          await updateTodoMutation.mutateAsync({
            id: selectedTodo.id,
            payload: payload as UpdateTodoPayload,
          });
        }}
      />

      <TodoGroupForm
        open={groupFormOpen}
        mode="edit"
        initialGroup={group}
        submitError={groupFormError}
        submitting={updateGroupMutation.isPending}
        onClose={() => {
          setGroupFormOpen(false);
          setGroupFormError(null);
        }}
        onSubmit={async (payload) => {
          await updateGroupMutation.mutateAsync(payload as UpdateTodoGroupPayload);
        }}
      />
    </div>
  );
}
