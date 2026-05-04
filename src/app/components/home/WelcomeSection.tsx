"use client";

import { Bell, CheckCircle2, FileText, ListTodo } from "lucide-react";
import type { DashboardStats } from "@/app/types/dashboard.types";
import { useAuth } from "@/app/hooks/useAuth";

type WelcomeSectionProps = {
  stats: DashboardStats;
};

const formatGeneratedAt = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function WelcomeSection({ stats }: WelcomeSectionProps) {
  const { user } = useAuth();
  const displayName =
    user?.fullname?.trim() || user?.email?.split("@")[0] || "there";

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard, {displayName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Updated {formatGeneratedAt(stats.generatedAt)}
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {stats.overview.topics} topics · {stats.overview.todoGroups} todo
          groups
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Notes"
          value={stats.overview.notes}
          detail={`${stats.overview.pinnedNotes} pinned`}
          icon={<FileText size={18} />}
        />
        <SummaryCard
          label="Open Todos"
          value={stats.overview.pendingTodos}
          detail={`${stats.overview.todos} total todos`}
          icon={<ListTodo size={18} />}
        />
        <SummaryCard
          label="Completed"
          value={stats.overview.completedTodos}
          detail={`${stats.todos.completionRate}% completion rate`}
          icon={<CheckCircle2 size={18} />}
        />
        <SummaryCard
          label="Unread"
          value={stats.overview.unreadNotifications}
          detail={`${stats.notifications.total} notifications`}
          icon={<Bell size={18} />}
        />
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </div>
  );
}
