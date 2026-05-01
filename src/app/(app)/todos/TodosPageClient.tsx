"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import TodoFilters, {
  type TodoFilterTab,
  type TodoViewMode,
} from "@/app/components/todos/TodoFilters";
import TodoForm from "@/app/components/todos/TodoForm";
import TodoGroupForm from "@/app/components/todos/TodoGroupForm";
import TodoGroupsList from "@/app/components/todos/TodoGroupsList";
import TodoList from "@/app/components/todos/TodoList";
import { todayDateInput } from "@/app/lib/todoUtils";
import { todoGroupService } from "@/app/services/todo-group.service";
import { todoService } from "@/app/services/todo.service";
import { topicsService } from "@/app/services/topic.service";
import type { TopicNode } from "@/app/types/topic.types";
import type {
  CreateTodoGroupPayload,
  CreateTodoPayload,
  PaginatedTodoGroupResponse,
  PaginatedTodoResponse,
  Todo,
  TodoGroup,
  TodoGroupQueryParams,
  TodoGroupType,
  TodoPriority,
  TodoQueryParams,
  TodoStatus,
  UpdateTodoGroupPayload,
  UpdateTodoPayload,
} from "@/app/types/todo.types";

const DEFAULT_LIMIT = 20;

const buildTopicLabelMap = (nodes: TopicNode[]): Record<string, string> => {
  const labels: Record<string, string> = {};

  const walk = (items: TopicNode[], parentPath = "") => {
    items.forEach((item) => {
      const label = parentPath ? `${parentPath} / ${item.name}` : item.name;
      labels[item.id] = label;
      if (item.children.length > 0) {
        walk(item.children, label);
      }
    });
  };

  walk(nodes);
  return labels;
};

const todosQueryKey = (params: TodoQueryParams) => ["todos", "list", params];
const todoGroupsQueryKey = (params: TodoGroupQueryParams) => [
  "todo-groups",
  "list",
  params,
];

export default function TodosPageClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<TodoViewMode>("todos");
  const [activeTab, setActiveTab] = useState<TodoFilterTab>("all");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<TodoPriority | "ALL">("ALL");
  const [status, setStatus] = useState<TodoStatus | "ALL">("ALL");
  const [groupType, setGroupType] = useState<TodoGroupType | "ALL">("ALL");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [page, setPage] = useState(1);
  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [todoFormMode, setTodoFormMode] = useState<"create" | "edit">("create");
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [groupFormMode, setGroupFormMode] = useState<"create" | "edit">("create");
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<TodoGroup | null>(null);
  const [todoFormError, setTodoFormError] = useState<string | null>(null);
  const [groupFormError, setGroupFormError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const todoQueryParams = useMemo<TodoQueryParams>(() => {
    const params: TodoQueryParams = {
      page,
      limit: DEFAULT_LIMIT,
    };

    if (deferredSearch.trim()) {
      params.search = deferredSearch.trim();
    }

    if (priority !== "ALL") {
      params.priority = priority;
    }

    if (status !== "ALL") {
      params.status = status;
    }

    if (selectedGroupId) {
      params.groupId = selectedGroupId;
    }

    if (activeTab === "completed") {
      params.status = "COMPLETED";
    } else if (activeTab !== "all") {
      params.due = activeTab;
    }

    return params;
  }, [activeTab, deferredSearch, page, priority, selectedGroupId, status]);

  const groupQueryParams = useMemo<TodoGroupQueryParams>(() => {
    const params: TodoGroupQueryParams = {
      page,
      limit: DEFAULT_LIMIT,
    };

    if (deferredSearch.trim()) {
      params.search = deferredSearch.trim();
    }

    if (groupType !== "ALL") {
      params.groupType = groupType;
    }

    if (activeTab === "today") {
      params.groupDate = todayDateInput();
    }

    return params;
  }, [activeTab, deferredSearch, groupType, page]);

  const todosQuery = useQuery<PaginatedTodoResponse, Error>({
    queryKey: todosQueryKey(todoQueryParams),
    queryFn: () => todoService.list(todoQueryParams),
  });

  const groupsQuery = useQuery<PaginatedTodoGroupResponse, Error>({
    queryKey: todoGroupsQueryKey(groupQueryParams),
    queryFn: () => todoGroupService.getTodoGroups(groupQueryParams),
  });

  const groupOptionsQuery = useQuery<PaginatedTodoGroupResponse, Error>({
    queryKey: ["todo-groups", "options"],
    queryFn: () => todoGroupService.getTodoGroups({ page: 1, limit: 100 }),
  });

  const topicsQuery = useQuery<TopicNode[], Error>({
    queryKey: ["topics", "tree"],
    queryFn: () => topicsService.getTree(),
  });

  const topicLabels = useMemo(
    () => buildTopicLabelMap(topicsQuery.data ?? []),
    [topicsQuery.data],
  );

  const invalidateTodoData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["todos"] }),
      queryClient.invalidateQueries({ queryKey: ["todo-groups"] }),
    ]);
  };

  const createTodoMutation = useMutation<Todo, Error, CreateTodoPayload>({
    mutationFn: (payload) => todoService.create(payload),
    onSuccess: async () => {
      await invalidateTodoData();
      setTodoFormOpen(false);
      setTodoFormError(null);
      setActionMessage("Todo created successfully.");
    },
    onError: (error) => {
      setTodoFormError(error.message);
      setActionMessage("Failed to create todo.");
    },
  });

  const updateTodoMutation = useMutation<
    Todo,
    Error,
    { id: string; payload: UpdateTodoPayload }
  >({
    mutationFn: ({ id, payload }) => todoService.update(id, payload),
    onSuccess: async () => {
      await invalidateTodoData();
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
      await invalidateTodoData();
      setActionMessage("Todo deleted successfully.");
    },
    onError: (error) => {
      setActionMessage(error.message || "Failed to delete todo.");
    },
  });

  const toggleTodoMutation = useMutation<
    Todo,
    Error,
    { todo: Todo; checked: boolean },
    { previous?: PaginatedTodoResponse }
  >({
    mutationFn: ({ todo, checked }) =>
      checked ? todoService.complete(todo.id) : todoService.uncomplete(todo.id),
    onMutate: async ({ todo, checked }) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey(todoQueryParams) });
      const previous = queryClient.getQueryData<PaginatedTodoResponse>(
        todosQueryKey(todoQueryParams),
      );

      queryClient.setQueryData<PaginatedTodoResponse>(
        todosQueryKey(todoQueryParams),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            items: current.items.map((item) =>
              item.id === todo.id
                ? {
                    ...item,
                    status: checked ? "COMPLETED" : "PENDING",
                    completed_at: checked ? new Date().toISOString() : null,
                  }
                : item,
            ),
          };
        },
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(todosQueryKey(todoQueryParams), context.previous);
      }
      setActionMessage(error.message || "Failed to update todo status.");
    },
    onSuccess: async (updated) => {
      await invalidateTodoData();
      setActionMessage(
        updated.status === "COMPLETED"
          ? "Todo marked as completed."
          : "Todo moved back to pending.",
      );
    },
  });

  const createGroupMutation = useMutation<
    TodoGroup,
    Error,
    CreateTodoGroupPayload
  >({
    mutationFn: (payload) => todoGroupService.createTodoGroup(payload),
    onSuccess: async (created) => {
      await invalidateTodoData();
      setGroupFormOpen(false);
      setGroupFormError(null);
      setActionMessage("Todo group created successfully.");
      if (created.group_type === "DAILY") {
        router.push(`/todos/groups/${created.id}`);
      }
    },
    onError: (error) => {
      setGroupFormError(error.message);
      setActionMessage("Failed to create todo group.");
    },
  });

  const updateGroupMutation = useMutation<
    TodoGroup,
    Error,
    { id: string; payload: UpdateTodoGroupPayload }
  >({
    mutationFn: ({ id, payload }) => todoGroupService.updateTodoGroup(id, payload),
    onSuccess: async () => {
      await invalidateTodoData();
      setGroupFormOpen(false);
      setSelectedGroup(null);
      setGroupFormError(null);
      setActionMessage("Todo group updated successfully.");
    },
    onError: (error) => {
      setGroupFormError(error.message);
      setActionMessage("Failed to update todo group.");
    },
  });

  const deleteGroupMutation = useMutation<{ message: string }, Error, string>({
    mutationFn: (groupId) => todoGroupService.deleteTodoGroup(groupId),
    onSuccess: async () => {
      await invalidateTodoData();
      setActionMessage(
        "Todo group deleted. Todos inside it remain as standalone todos.",
      );
    },
    onError: (error) => {
      setActionMessage(error.message || "Failed to delete todo group.");
    },
  });

  const todayGroupMutation = useMutation<TodoGroup, Error, void>({
    mutationFn: async () => {
      const today = todayDateInput();
      const existing = await todoGroupService.getTodoGroups({
        groupType: "DAILY",
        groupDate: today,
        page: 1,
        limit: 1,
      });

      if (existing.items.length > 0) {
        return existing.items[0];
      }

      return todoGroupService.createTodoGroup({
        name: "Todo hôm nay",
        group_type: "DAILY",
        group_date: today,
      });
    },
    onSuccess: async (group) => {
      await invalidateTodoData();
      router.push(`/todos/groups/${group.id}`);
    },
    onError: (error) => {
      setActionMessage(error.message || "Failed to open today's todo group.");
    },
  });

  const todos = todosQuery.data?.items ?? [];
  const todoMeta = todosQuery.data?.meta;
  const groups = groupsQuery.data?.items ?? [];
  const groupMeta = groupsQuery.data?.meta;
  const groupOptions = groupOptionsQuery.data?.items ?? [];
  const activeMeta = viewMode === "todos" ? todoMeta : groupMeta;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TodoFilters
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setPage(1);
        }}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        priority={priority}
        onPriorityChange={(value) => {
          setPriority(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        selectedGroupId={selectedGroupId}
        onGroupChange={(value) => {
          setSelectedGroupId(value);
          setPage(1);
        }}
        groups={groupOptions}
        groupType={groupType}
        onGroupTypeChange={(value) => {
          setGroupType(value);
          setPage(1);
        }}
        onCreateTodo={() => {
          setTodoFormMode("create");
          setSelectedTodo(null);
          setTodoFormError(null);
          setTodoFormOpen(true);
        }}
        onCreateGroup={() => {
          setGroupFormMode("create");
          setSelectedGroup(null);
          setGroupFormError(null);
          setGroupFormOpen(true);
        }}
        onTodayGroup={() => todayGroupMutation.mutate()}
      />

      {actionMessage && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {actionMessage}
        </div>
      )}

      {viewMode === "todos" ? (
        <TodoList
          todos={todos}
          loading={todosQuery.isLoading}
          error={todosQuery.error?.message ?? null}
          topicLabels={topicLabels}
          togglingTodoId={toggleTodoMutation.variables?.todo.id ?? null}
          editingTodoId={
            updateTodoMutation.isPending
              ? updateTodoMutation.variables?.id ?? null
              : null
          }
          deletingTodoId={
            deleteTodoMutation.isPending ? deleteTodoMutation.variables : null
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
      ) : (
        <TodoGroupsList
          groups={groups}
          loading={groupsQuery.isLoading}
          error={groupsQuery.error?.message ?? null}
          topicLabels={topicLabels}
          editingGroupId={
            updateGroupMutation.isPending
              ? updateGroupMutation.variables?.id ?? null
              : null
          }
          deletingGroupId={
            deleteGroupMutation.isPending ? deleteGroupMutation.variables : null
          }
          onEdit={(group) => {
            setGroupFormMode("edit");
            setSelectedGroup(group);
            setGroupFormError(null);
            setGroupFormOpen(true);
          }}
          onDelete={(group) => {
            if (
              !window.confirm(
                "Delete this group? Todos inside it will not be deleted and will become standalone todos.",
              )
            ) {
              return;
            }
            deleteGroupMutation.mutate(group.id);
          }}
        />
      )}

      {activeMeta && activeMeta.totalPages > 1 && (
        <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Page {activeMeta.page} / {activeMeta.totalPages} - {activeMeta.total}{" "}
            {viewMode}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  activeMeta.totalPages
                    ? Math.min(activeMeta.totalPages, current + 1)
                    : current + 1,
                )
              }
              disabled={page >= activeMeta.totalPages}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      )}

      <TodoForm
        open={todoFormOpen}
        mode={todoFormMode}
        initialTodo={selectedTodo}
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
        mode={groupFormMode}
        initialGroup={selectedGroup}
        defaultGroupType="CUSTOM"
        submitError={groupFormError}
        submitting={
          createGroupMutation.isPending || updateGroupMutation.isPending
        }
        onClose={() => {
          setGroupFormOpen(false);
          setSelectedGroup(null);
          setGroupFormError(null);
        }}
        onSubmit={async (payload) => {
          if (groupFormMode === "create") {
            await createGroupMutation.mutateAsync(payload as CreateTodoGroupPayload);
            return;
          }

          if (!selectedGroup) return;

          await updateGroupMutation.mutateAsync({
            id: selectedGroup.id,
            payload: payload as UpdateTodoGroupPayload,
          });
        }}
      />
    </div>
  );
}
