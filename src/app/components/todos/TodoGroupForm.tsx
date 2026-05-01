"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { buildTodoGroupPayload, todayDateInput, TODO_GROUP_TYPES, TODO_GROUP_TYPE_LABELS } from "@/app/lib/todoUtils";
import { notesService } from "@/app/services/notes.service";
import { topicsService } from "@/app/services/topic.service";
import type { Note } from "@/app/types/note.types";
import type { TopicNode } from "@/app/types/topic.types";
import type {
  CreateTodoGroupPayload,
  TodoGroup,
  TodoGroupType,
  UpdateTodoGroupPayload,
} from "@/app/types/todo.types";

type TodoGroupFormProps = {
  open: boolean;
  mode: "create" | "edit";
  initialGroup?: TodoGroup | null;
  defaultGroupType?: TodoGroupType;
  defaultTopicId?: string | null;
  defaultNoteId?: string | null;
  defaultGroupDate?: string | null;
  lockGroupType?: boolean;
  lockTopicId?: boolean;
  lockNoteId?: boolean;
  submitError?: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateTodoGroupPayload | UpdateTodoGroupPayload,
  ) => Promise<void> | void;
};

type FormValues = {
  name: string;
  description: string;
  group_type: TodoGroupType;
  group_date: string;
  topic_id: string;
  note_id: string;
  order_index: string;
};

const emptyValues: FormValues = {
  name: "",
  description: "",
  group_type: "CUSTOM",
  group_date: "",
  topic_id: "",
  note_id: "",
  order_index: "",
};

const flattenTopics = (nodes: TopicNode[], prefix = ""): Array<{ id: string; label: string }> =>
  nodes.flatMap((node) => {
    const label = prefix ? `${prefix} / ${node.name}` : node.name;
    return [{ id: node.id, label }, ...flattenTopics(node.children, label)];
  });

export default function TodoGroupForm({
  open,
  mode,
  initialGroup,
  defaultGroupType = "CUSTOM",
  defaultTopicId,
  defaultNoteId,
  defaultGroupDate,
  lockGroupType = false,
  lockTopicId = false,
  lockNoteId = false,
  submitError,
  submitting,
  onClose,
  onSubmit,
}: TodoGroupFormProps) {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  const topicsQuery = useQuery<TopicNode[], Error>({
    queryKey: ["topics", "tree"],
    queryFn: () => topicsService.getTree(),
    enabled: open,
  });

  const notesQuery = useQuery<Note[], Error>({
    queryKey: ["notes", "topic", values.topic_id],
    queryFn: () => notesService.getByTopic(values.topic_id),
    enabled: open && !!values.topic_id,
  });

  const initialValues = useMemo<FormValues>(() => {
    if (mode === "edit" && initialGroup) {
      return {
        name: initialGroup.name,
        description: initialGroup.description ?? "",
        group_type: initialGroup.group_type,
        group_date: initialGroup.group_date ?? "",
        topic_id: initialGroup.topic_id ?? "",
        note_id: initialGroup.note_id ?? "",
        order_index:
          typeof initialGroup.order_index === "number"
            ? String(initialGroup.order_index)
            : "",
      };
    }

    return {
      ...emptyValues,
      group_type: defaultGroupType,
      topic_id: defaultTopicId ?? "",
      note_id: defaultNoteId ?? "",
      group_date:
        defaultGroupDate ??
        (defaultGroupType === "DAILY" ? todayDateInput() : ""),
    };
  }, [
    defaultGroupDate,
    defaultGroupType,
    defaultNoteId,
    defaultTopicId,
    initialGroup,
    mode,
  ]);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues);
    setValidationError(null);
  }, [initialValues, open]);

  if (!open) return null;

  const topicOptions = flattenTopics(topicsQuery.data ?? []);

  const handleChange = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => {
      if (key === "topic_id" && current.topic_id !== value) {
        return {
          ...current,
          topic_id: value as string,
          note_id: "",
        };
      }
      return { ...current, [key]: value };
    });
    setValidationError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.name.trim()) {
      setValidationError("Group name is required.");
      return;
    }

    if (values.group_type === "NOTE" && !values.note_id.trim()) {
      setValidationError("Note group requires a note.");
      return;
    }

    if (values.group_type === "TOPIC" && !values.topic_id.trim()) {
      setValidationError("Topic group requires a topic.");
      return;
    }

    if (values.group_type === "DAILY" && !values.group_date.trim()) {
      setValidationError("Daily group requires a date.");
      return;
    }

    const payload = buildTodoGroupPayload(
      values,
      mode === "create" ? "create" : "update",
    );

    await onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!submitting) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === "create" ? "Create todo group" : "Edit todo group"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Organize related todos into a reusable group.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Release checklist"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={values.description}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Optional description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Group type
              </label>
              <select
                value={values.group_type}
                disabled={lockGroupType}
                onChange={(event) =>
                  handleChange("group_type", event.target.value as TodoGroupType)
                }
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50"
              >
                {TODO_GROUP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TODO_GROUP_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Daily date
              </label>
              <input
                type="date"
                value={values.group_date}
                disabled={values.group_type !== "DAILY"}
                onChange={(event) =>
                  handleChange("group_date", event.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Topic
              </label>
              <select
                value={values.topic_id}
                disabled={lockTopicId}
                onChange={(event) => handleChange("topic_id", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50"
              >
                <option value="">No topic</option>
                {topicOptions.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Note
              </label>
              <select
                value={values.note_id}
                disabled={lockNoteId || !values.topic_id}
                onChange={(event) => handleChange("note_id", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50"
              >
                <option value="">No note</option>
                {(notesQuery.data ?? []).map((note) => (
                  <option key={note.id} value={note.id}>
                    {note.title || "Untitled note"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Order index
            </label>
            <input
              type="number"
              value={values.order_index}
              onChange={(event) =>
                handleChange("order_index", event.target.value)
              }
              className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="0"
            />
          </div>

          {(validationError || submitError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationError || submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create group"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
