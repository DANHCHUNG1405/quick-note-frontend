"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TodoForm from "@/app/components/todos/TodoForm";
import TodoList from "@/app/components/todos/TodoList";
import { todoService } from "@/app/services/todo.service";
import type {
  CreateTodoPayload,
  PaginatedTodoResponse,
  Todo,
  UpdateTodoPayload,
} from "@/app/types/todo.types";

type RelatedTodosProps = {
  noteId: string;
  topicId?: string | null;
};

const relatedTodoQueryKey = (noteId: string) => ["todos", "related-note", noteId];

export default function RelatedTodos({
  noteId,
  topicId,
}: RelatedTodosProps) {
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const todosQuery = useQuery<PaginatedTodoResponse, Error>({
    queryKey: relatedTodoQueryKey(noteId),
    queryFn: () => todoService.list({ noteId, limit: 20, page: 1 }),
    enabled: !!noteId,
  });

  const createMutation = useMutation<Todo, Error, CreateTodoPayload>({
    mutationFn: (payload) => todoService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
      setFormOpen(false);
      setFormError(null);
      setActionMessage("Standalone todo created successfully.");
    },
    onError: (error) => {
      setFormError(error.message);
      setActionMessage("Failed to create standalone todo.");
    },
  });

  const updateMutation = useMutation<
    Todo,
    Error,
    { id: string; payload: UpdateTodoPayload }
  >({
    mutationFn: ({ id, payload }) => todoService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
      setFormOpen(false);
      setSelectedTodo(null);
      setFormError(null);
      setActionMessage("Standalone todo updated successfully.");
    },
    onError: (error) => {
      setFormError(error.message);
      setActionMessage("Failed to update standalone todo.");
    },
  });

  const toggleMutation = useMutation<Todo, Error, { todo: Todo; checked: boolean }>({
    mutationFn: ({ todo, checked }) =>
      checked ? todoService.complete(todo.id) : todoService.uncomplete(todo.id),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
      setActionMessage(
        updated.status === "COMPLETED"
          ? "Standalone todo marked as completed."
          : "Standalone todo moved back to pending.",
      );
    },
  });

  const deleteMutation = useMutation<{ message: string }, Error, string>({
    mutationFn: (todoId) => todoService.remove(todoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
      setActionMessage("Standalone todo deleted successfully.");
    },
    onError: (error) => {
      setActionMessage(error.message || "Failed to delete standalone todo.");
    },
  });

  const todos = useMemo(
    () => (todosQuery.data?.items ?? []).filter((todo) => !todo.group_id),
    [todosQuery.data],
  );

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Todo rời rạc</h2>
          <p className="mt-1 text-sm text-slate-500">
            Các todo chưa thuộc group nào nhưng vẫn liên quan tới note hiện tại.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormMode("create");
            setSelectedTodo(null);
            setFormError(null);
            setFormOpen(true);
          }}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          + Thêm todo rời rạc
        </button>
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {actionMessage}
        </div>
      )}

      <TodoList
        todos={todos}
        loading={todosQuery.isLoading}
        error={todosQuery.error?.message ?? null}
        emptyTitle="Chưa có todo rời rạc nào"
        emptyDescription="Tạo todo ngoài group nếu bạn cần ghi nhanh một việc nhỏ cho note."
        togglingTodoId={toggleMutation.variables?.todo.id ?? null}
        editingTodoId={
          updateMutation.isPending ? updateMutation.variables?.id ?? null : null
        }
        deletingTodoId={deleteMutation.isPending ? deleteMutation.variables : null}
        onToggleComplete={(todo, checked) => {
          toggleMutation.mutate({ todo, checked });
        }}
        onEdit={(todo) => {
          setFormMode("edit");
          setSelectedTodo(todo);
          setFormError(null);
          setFormOpen(true);
        }}
        onDelete={(todo) => {
          if (!window.confirm("Delete this standalone todo?")) {
            return;
          }
          deleteMutation.mutate(todo.id);
        }}
      />

      <TodoForm
        open={formOpen}
        mode={formMode}
        initialTodo={selectedTodo}
        defaultNoteId={noteId}
        defaultTopicId={topicId}
        lockNoteId
        lockTopicId={!!topicId}
        allowGroupSelection={false}
        submitError={formError}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setFormOpen(false);
          setSelectedTodo(null);
          setFormError(null);
        }}
        onSubmit={async (payload) => {
          if (formMode === "create") {
            await createMutation.mutateAsync(payload as CreateTodoPayload);
            return;
          }

          if (!selectedTodo) return;

          await updateMutation.mutateAsync({
            id: selectedTodo.id,
            payload: payload as UpdateTodoPayload,
          });
        }}
      />
    </section>
  );
}
