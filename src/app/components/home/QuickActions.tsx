"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, CirclePlus, Flag } from "lucide-react";
import type {
  DashboardStats,
  DashboardTodoItem,
} from "@/app/types/dashboard.types";

type QuickActionsProps = {
  stats: DashboardStats;
};

const formatDueDate = (value?: string | null) => {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function QuickActions({ stats }: QuickActionsProps) {
  return (
    <aside className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-primary" />
            <h2 className="text-base font-bold text-slate-900">Priority</h2>
          </div>
          <Link href="/todos" className="text-sm font-semibold text-primary">
            Todos
          </Link>
        </div>

        <div className="space-y-3">
          <PriorityRow label="Urgent" value={stats.todos.byPriority.URGENT} />
          <PriorityRow label="High" value={stats.todos.byPriority.HIGH} />
          <PriorityRow label="Normal" value={stats.todos.byPriority.NORMAL} />
          <PriorityRow label="Low" value={stats.todos.byPriority.LOW} />
        </div>
      </section>

      <TodoPanel
        title="Overdue"
        icon={<AlertTriangle size={18} />}
        todos={stats.activity.overdueTodos}
        empty="No overdue todos."
      />
      <TodoPanel
        title="Upcoming"
        icon={<CalendarClock size={18} />}
        todos={stats.activity.upcomingTodos}
        empty="No upcoming todos."
      />

      <Link
        href="/notes/new"
        className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-3 text-sm font-semibold text-white hover:brightness-110"
      >
        <CirclePlus size={18} />
        New note
      </Link>
    </aside>
  );
}

function PriorityRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function TodoPanel({
  title,
  icon,
  todos,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  todos: DashboardTodoItem[];
  empty: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-slate-500">{icon}</div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>

      <div className="space-y-2">
        {todos.length === 0 && (
          <p className="text-sm text-slate-400">{empty}</p>
        )}
        {todos.slice(0, 5).map((todo) => (
          <div key={todo.id} className="rounded-md bg-slate-50 px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-800">
              {todo.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDueDate(todo.due_at || todo.dueAt)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
