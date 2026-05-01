"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Check, ChevronDown, ChevronRight, FolderTree, NotebookText } from "lucide-react";
import {
  buildTodoPayload,
  formatTodoDateInput,
  toIsoOrNull,
  TODO_PRIORITIES,
  TODO_PRIORITY_LABELS,
  TODO_STATUSES,
  TODO_STATUS_LABELS,
} from "@/app/lib/todoUtils";
import { todoGroupService } from "@/app/services/todo-group.service";
import { notesService } from "@/app/services/notes.service";
import { topicsService } from "@/app/services/topic.service";
import type { Note } from "@/app/types/note.types";
import type { TopicNode } from "@/app/types/topic.types";
import type {
  CreateTodoPayload,
  PaginatedTodoGroupResponse,
  Todo,
  TodoPriority,
  TodoStatus,
  UpdateTodoPayload,
} from "@/app/types/todo.types";

type TodoFormValues = {
  title: string;
  description: string;
  due_at: string;
  priority: TodoPriority;
  status: TodoStatus;
  topic_id: string;
  note_id: string;
  group_id: string;
};

type TodoFormProps = {
  open: boolean;
  mode: "create" | "edit";
  initialTodo?: Todo | null;
  defaultTopicId?: string | null;
  defaultNoteId?: string | null;
  defaultGroupId?: string | null;
  lockTopicId?: boolean;
  lockNoteId?: boolean;
  lockGroupId?: boolean;
  allowGroupSelection?: boolean;
  submitError?: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateTodoPayload | UpdateTodoPayload,
  ) => Promise<void> | void;
};

type TopicOption = {
  id: string;
  label: string;
};

const emptyValues: TodoFormValues = {
  title: "",
  description: "",
  due_at: "",
  priority: "NORMAL",
  status: "PENDING",
  topic_id: "",
  note_id: "",
  group_id: "",
};

const formatDateTimeMin = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getChildrenLabel = (count: number): string => {
  if (count === 1) return "1 subtopic";
  return `${count} subtopics`;
};

function TopicTreeOption({
  node,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
  depth = 0,
}: {
  node: TopicNode;
  selectedId: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
          isSelected
            ? "border-primary/30 bg-primary/10"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
        }`}
        style={{ marginLeft: `${depth * 14}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label={isExpanded ? "Collapse topic" : "Expand topic"}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="flex h-7 w-7 items-center justify-center text-slate-300">
            <FolderTree size={14} />
          </span>
        )}

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {node.name}
            </p>
            {hasChildren && (
              <p className="text-xs text-slate-500">
                {getChildrenLabel(node.children.length)}
              </p>
            )}
          </div>

          {isSelected && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
              <Check size={14} />
            </span>
          )}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <TopicTreeOption
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteDropdown({
  notes,
  selectedId,
  selectedLabel,
  disabled,
  loading,
  error,
  panelPosition = "bottom",
  onSelect,
}: {
  notes: Note[];
  selectedId: string;
  selectedLabel: string;
  disabled: boolean;
  loading: boolean;
  error?: string | null;
  panelPosition?: "top" | "bottom";
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const panelPositionClass =
    panelPosition === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-800 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className="flex min-w-0 items-center gap-2">
          <NotebookText size={16} className="text-slate-400" />
          <span className="truncate">
            {!selectedId
              ? loading
                ? "Loading notes..."
                : "Select a note"
              : selectedLabel || "Selected note"}
          </span>
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {open && !disabled && (
        <div
          className={`absolute left-0 z-20 max-h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${panelPositionClass}`}
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Notes
            </p>
          </div>

          <div className="max-h-56 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                onSelect("");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                !selectedId
                  ? "bg-primary/10 text-primary"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>No note</span>
              {!selectedId && <Check size={14} />}
            </button>

            {notes.map((note) => {
              const isSelected = selectedId === note.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => {
                    onSelect(note.id);
                    setOpen(false);
                  }}
                  className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{note.title || "Untitled note"}</span>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}

            {!loading && notes.length === 0 && (
              <div className="px-3 py-4 text-sm text-slate-500">
                No notes found in this topic.
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function TopicDropdown({
  topics,
  selectedId,
  selectedLabel,
  disabled,
  loading,
  error,
  panelPosition = "bottom",
  onSelect,
}: {
  topics: TopicNode[];
  selectedId: string;
  selectedLabel: string;
  disabled: boolean;
  loading: boolean;
  error?: string | null;
  panelPosition?: "top" | "bottom";
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!selectedId) return;

    const findParents = (
      nodes: TopicNode[],
      targetId: string,
      trail: string[] = [],
    ): string[] | null => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return trail;
        }

        const next = findParents(node.children, targetId, [...trail, node.id]);
        if (next) {
          return next;
        }
      }

      return null;
    };

    const parents = findParents(topics, selectedId);
    if (parents) {
      setExpandedIds(new Set(parents));
    }
  }, [selectedId, topics]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const panelPositionClass =
    panelPosition === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-800 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className="flex min-w-0 items-center gap-2">
          <FolderTree size={16} className="text-slate-400" />
          <span className="truncate">
            {!selectedId
              ? loading
                ? "Loading topics..."
                : "Select a topic"
              : selectedLabel || "Selected topic"}
          </span>
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {open && !disabled && (
        <div
          className={`absolute left-0 z-20 max-h-[26rem] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${panelPositionClass}`}
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Topics
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                onSelect("");
                setOpen(false);
              }}
              className={`mb-2 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                !selectedId
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>No topic</span>
              {!selectedId && <Check size={14} />}
            </button>

            <div className="space-y-2">
              {topics.map((topic) => (
                <TopicTreeOption
                  key={topic.id}
                  node={topic}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onToggle={toggleExpanded}
                  onSelect={(id) => {
                    onSelect(id);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function TodoForm({
  open,
  mode,
  initialTodo,
  defaultTopicId,
  defaultNoteId,
  defaultGroupId,
  lockTopicId = false,
  lockNoteId = false,
  lockGroupId = false,
  allowGroupSelection = true,
  submitError,
  submitting,
  onClose,
  onSubmit,
}: TodoFormProps) {
  const [values, setValues] = useState<TodoFormValues>(emptyValues);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const nowMin = useMemo(() => formatDateTimeMin(new Date()), [open]);

  const initialValues = useMemo<TodoFormValues>(() => {
    if (mode === "edit" && initialTodo) {
      return {
        title: initialTodo.title,
        description: initialTodo.description ?? "",
        due_at: formatTodoDateInput(initialTodo.due_at),
        priority: initialTodo.priority,
        status: initialTodo.status,
        topic_id: initialTodo.topic_id ?? "",
        note_id: initialTodo.note_id ?? "",
        group_id: initialTodo.group_id ?? initialTodo.group?.id ?? "",
      };
    }

    return {
      ...emptyValues,
      topic_id: defaultTopicId ?? "",
      note_id: defaultNoteId ?? "",
      group_id: defaultGroupId ?? "",
    };
  }, [defaultGroupId, defaultNoteId, defaultTopicId, initialTodo, mode]);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues);
    setTitleError(null);
    setDueDateError(null);
  }, [initialValues, open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, open, submitting]);

  const topicsQuery = useQuery<TopicNode[], Error>({
    queryKey: ["topics", "tree"],
    queryFn: () => topicsService.getTree(),
    enabled: open && mode === "create",
  });

  const selectedTopicId = values.topic_id.trim();
  const groupsQuery = useQuery<PaginatedTodoGroupResponse, Error>({
    queryKey: ["todo-groups", "options"],
    queryFn: () => todoGroupService.getTodoGroups({ page: 1, limit: 100 }),
    enabled: open && allowGroupSelection && !lockGroupId,
  });

  const notesQuery = useQuery<Note[], Error>({
    queryKey: ["notes", "topic", selectedTopicId],
    queryFn: () => notesService.getByTopic(selectedTopicId),
    enabled: open && mode === "create" && !!selectedTopicId,
  });

  const topicOptions = useMemo(() => {
    const flatten = (nodes: TopicNode[], parentLabel = ""): TopicOption[] =>
      nodes.flatMap((node) => {
        const label = parentLabel ? `${parentLabel} / ${node.name}` : node.name;
        return [
          { id: node.id, label },
          ...flatten(node.children, label),
        ];
      });

    return flatten(topicsQuery.data ?? []);
  }, [topicsQuery.data]);

  const selectedTopicLabel = useMemo(
    () => topicOptions.find((topic) => topic.id === values.topic_id)?.label ?? "",
    [topicOptions, values.topic_id],
  );

  const selectedNoteLabel = useMemo(
    () =>
      notesQuery.data?.find((note) => note.id === values.note_id)?.title ??
      "",
    [notesQuery.data, values.note_id],
  );

  if (!open) return null;

  const handleChange = <K extends keyof TodoFormValues>(
    key: K,
    value: TodoFormValues[K],
  ) => {
    setValues((current) => {
      if (key === "topic_id") {
        return {
          ...current,
          topic_id: value as string,
          note_id:
            current.topic_id === value || lockNoteId ? current.note_id : "",
        };
      }

      return { ...current, [key]: value };
    });

    if (key === "title") {
      setTitleError(null);
    }

    if (key === "due_at") {
      const iso = toIsoOrNull(value as string);
      if (iso && new Date(iso).getTime() < Date.now()) {
        setDueDateError("Due date cannot be in the past.");
      } else {
        setDueDateError(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.title.trim()) {
      setTitleError("Title is required.");
      return;
    }

    const dueIso = toIsoOrNull(values.due_at);
    if (dueIso && new Date(dueIso).getTime() < Date.now()) {
      setDueDateError("Due date cannot be in the past.");
      return;
    }

    const payload = buildTodoPayload(
      values,
      mode === "edit" ? "update" : "create",
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
            {mode === "create" ? "Add todo" : "Edit todo"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "create"
              ? "Create a task and attach it to a topic or note when needed."
              : "Update content, deadline, priority, and status."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              value={values.title}
              onChange={(event) => handleChange("title", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Example: Review release checklist"
            />
            {titleError && (
              <p className="mt-2 text-sm text-red-600">{titleError}</p>
            )}
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
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Describe the work to be done"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Due date
              </label>
              <div className="relative">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="datetime-local"
                  value={values.due_at}
                  min={nowMin}
                  onChange={(event) =>
                    handleChange("due_at", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {dueDateError && (
                <p className="mt-2 text-sm text-red-600">{dueDateError}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Priority
              </label>
              <select
                value={values.priority}
                onChange={(event) =>
                  handleChange("priority", event.target.value as TodoPriority)
                }
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {TODO_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {TODO_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mode === "create" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Topic
                </label>
                <TopicDropdown
                  topics={topicsQuery.data ?? []}
                  selectedId={values.topic_id}
                  selectedLabel={selectedTopicLabel}
                  disabled={lockTopicId}
                  loading={topicsQuery.isLoading}
                  error={!lockTopicId ? topicsQuery.error?.message : null}
                  panelPosition="top"
                  onSelect={(id) => handleChange("topic_id", id)}
                />
                {lockTopicId && selectedTopicLabel && (
                  <p className="mt-2 text-xs text-slate-500">
                    Topic is fixed for this todo: {selectedTopicLabel}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Note
                </label>
                <NoteDropdown
                  notes={notesQuery.data ?? []}
                  selectedId={values.note_id}
                  selectedLabel={selectedNoteLabel}
                  disabled={lockNoteId || !selectedTopicId}
                  loading={notesQuery.isLoading}
                  error={
                    !lockNoteId && selectedTopicId
                      ? notesQuery.error?.message
                      : null
                  }
                  panelPosition="top"
                  onSelect={(id) => handleChange("note_id", id)}
                />
                {lockNoteId && selectedNoteLabel && (
                  <p className="mt-2 text-xs text-slate-500">
                    Note is fixed for this todo: {selectedNoteLabel}
                  </p>
                )}
                {!lockNoteId && !selectedTopicId && (
                  <p className="mt-2 text-xs text-slate-500">
                    Select a topic first to load related notes.
                  </p>
                )}
              </div>
            </div>
          )}

          {allowGroupSelection && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Group
              </label>
              <select
                value={values.group_id}
                disabled={lockGroupId}
                onChange={(event) => handleChange("group_id", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50"
              >
                <option value="">No group</option>
                {(groupsQuery.data?.items ?? []).map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {lockGroupId && values.group_id && (
            <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-slate-700">
              This todo will be added to the current group.
            </div>
          )}

          {mode === "edit" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                value={values.status}
                onChange={(event) =>
                  handleChange("status", event.target.value as TodoStatus)
                }
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {TODO_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TODO_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
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
                  ? "Create todo"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
