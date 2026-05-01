"use client";

import type {
  TodoDueFilter,
  TodoGroup,
  TodoGroupType,
  TodoPriority,
  TodoStatus,
} from "@/app/types/todo.types";

export type TodoFilterTab = "all" | TodoDueFilter | "completed";
export type TodoViewMode = "todos" | "groups";

type TodoFiltersProps = {
  viewMode: TodoViewMode;
  onViewModeChange: (mode: TodoViewMode) => void;
  activeTab: TodoFilterTab;
  onTabChange: (tab: TodoFilterTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  priority: TodoPriority | "ALL";
  onPriorityChange: (value: TodoPriority | "ALL") => void;
  status: TodoStatus | "ALL";
  onStatusChange: (value: TodoStatus | "ALL") => void;
  selectedGroupId: string;
  onGroupChange: (value: string) => void;
  groups: TodoGroup[];
  groupType: TodoGroupType | "ALL";
  onGroupTypeChange: (value: TodoGroupType | "ALL") => void;
  onCreateTodo: () => void;
  onCreateGroup: () => void;
  onTodayGroup: () => void;
};

const tabs: Array<{ id: TodoFilterTab; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "today", label: "Hôm nay" },
  { id: "upcoming", label: "Sắp tới" },
  { id: "overdue", label: "Quá hạn" },
  { id: "completed", label: "Đã hoàn thành" },
];

const modes: Array<{ id: TodoViewMode; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "groups", label: "Groups" },
];

export default function TodoFilters({
  viewMode,
  onViewModeChange,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  selectedGroupId,
  onGroupChange,
  groups,
  groupType,
  onGroupTypeChange,
  onCreateTodo,
  onCreateGroup,
  onTodayGroup,
}: TodoFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Todos</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý todo rời rạc hoặc tổ chức theo group theo note, topic và ngày.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onTodayGroup}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Todo hôm nay
            </button>
            <button
              type="button"
              onClick={onCreateTodo}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Thêm todo
            </button>
            <button
              type="button"
              onClick={onCreateGroup}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Tạo group
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => {
            const active = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onViewModeChange(mode.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tiêu đề hoặc mô tả"
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          <select
            value={priority}
            onChange={(event) =>
              onPriorityChange(event.target.value as TodoPriority | "ALL")
            }
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">Tất cả ưu tiên</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as TodoStatus | "ALL")
            }
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={selectedGroupId}
            onChange={(event) => onGroupChange(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tất cả group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {viewMode === "groups" && (
          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={groupType}
              onChange={(event) =>
                onGroupTypeChange(event.target.value as TodoGroupType | "ALL")
              }
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Tất cả loại group</option>
              <option value="CUSTOM">Custom</option>
              <option value="NOTE">Note</option>
              <option value="DAILY">Daily</option>
              <option value="TOPIC">Topic</option>
            </select>
          </div>
        )}
      </div>
    </section>
  );
}
