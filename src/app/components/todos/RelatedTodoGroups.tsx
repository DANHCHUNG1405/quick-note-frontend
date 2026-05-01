"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TodoGroupForm from "@/app/components/todos/TodoGroupForm";
import TodoGroupsList from "@/app/components/todos/TodoGroupsList";
import { todoGroupService } from "@/app/services/todo-group.service";
import type {
  CreateTodoGroupPayload,
  PaginatedTodoGroupResponse,
  TodoGroup,
  UpdateTodoGroupPayload,
} from "@/app/types/todo.types";

type RelatedTodoGroupsProps = {
  noteId: string;
  topicId?: string | null;
};

const relatedGroupQueryKey = (noteId: string) => ["todo-groups", "note", noteId];

export default function RelatedTodoGroups({
  noteId,
  topicId,
}: RelatedTodoGroupsProps) {
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TodoGroup | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const groupsQuery = useQuery<PaginatedTodoGroupResponse, Error>({
    queryKey: relatedGroupQueryKey(noteId),
    queryFn: () =>
      todoGroupService.getTodoGroups({ noteId, limit: 20, page: 1 }),
    enabled: !!noteId,
  });

  const createMutation = useMutation<TodoGroup, Error, CreateTodoGroupPayload>({
    mutationFn: (payload) => todoGroupService.createTodoGroup(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: relatedGroupQueryKey(noteId) });
      void queryClient.invalidateQueries({ queryKey: ["todo-groups"] });
      setFormOpen(false);
      setFormError(null);
      setActionMessage("Todo group created successfully.");
    },
    onError: (error) => {
      setFormError(error.message);
      setActionMessage("Failed to create todo group.");
    },
  });

  const updateMutation = useMutation<
    TodoGroup,
    Error,
    { id: string; payload: UpdateTodoGroupPayload }
  >({
    mutationFn: ({ id, payload }) =>
      todoGroupService.updateTodoGroup(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: relatedGroupQueryKey(noteId) });
      void queryClient.invalidateQueries({ queryKey: ["todo-groups"] });
      setFormOpen(false);
      setSelectedGroup(null);
      setFormError(null);
      setActionMessage("Todo group updated successfully.");
    },
    onError: (error) => {
      setFormError(error.message);
      setActionMessage("Failed to update todo group.");
    },
  });

  const deleteMutation = useMutation<{ message: string }, Error, string>({
    mutationFn: (groupId) => todoGroupService.deleteTodoGroup(groupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: relatedGroupQueryKey(noteId) });
      void queryClient.invalidateQueries({ queryKey: ["todo-groups"] });
      setActionMessage(
        "Todo group deleted. Todos inside it remain as standalone todos.",
      );
    },
    onError: (error) => {
      setActionMessage(error.message || "Failed to delete todo group.");
    },
  });

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Todo groups liên quan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ưu tiên tổ chức todos theo group cho note hiện tại.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormMode("create");
            setSelectedGroup(null);
            setFormError(null);
            setFormOpen(true);
          }}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          + Tạo group
        </button>
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {actionMessage}
        </div>
      )}

      <TodoGroupsList
        groups={groupsQuery.data?.items ?? []}
        loading={groupsQuery.isLoading}
        error={groupsQuery.error?.message ?? null}
        emptyTitle="Chưa có todo group nào cho note này"
        emptyDescription="Tạo group đầu tiên để gom các việc cần làm theo note."
        editingGroupId={
          updateMutation.isPending ? updateMutation.variables?.id ?? null : null
        }
        deletingGroupId={
          deleteMutation.isPending ? deleteMutation.variables ?? null : null
        }
        onEdit={(group) => {
          setFormMode("edit");
          setSelectedGroup(group);
          setFormError(null);
          setFormOpen(true);
        }}
        onDelete={(group) => {
          if (
            !window.confirm(
              "Delete this group? Todos inside it will not be deleted and will become standalone todos.",
            )
          ) {
            return;
          }
          deleteMutation.mutate(group.id);
        }}
      />

      <TodoGroupForm
        open={formOpen}
        mode={formMode}
        initialGroup={selectedGroup}
        defaultGroupType="NOTE"
        defaultNoteId={noteId}
        defaultTopicId={topicId}
        lockGroupType
        lockNoteId
        lockTopicId={!!topicId}
        submitError={formError}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setFormOpen(false);
          setSelectedGroup(null);
          setFormError(null);
        }}
        onSubmit={async (payload) => {
          if (formMode === "create") {
            await createMutation.mutateAsync(payload as CreateTodoGroupPayload);
            return;
          }

          if (!selectedGroup) return;

          await updateMutation.mutateAsync({
            id: selectedGroup.id,
            payload: payload as UpdateTodoGroupPayload,
          });
        }}
      />
    </section>
  );
}
