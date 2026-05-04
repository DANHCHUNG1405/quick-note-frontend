import { AlertTriangle, Bookmark, Share2, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/app/types/dashboard.types";

type TopicOverviewProps = {
  stats: DashboardStats;
};

export default function TopicOverview({ stats }: TopicOverviewProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-primary" />
          <h2 className="text-base font-bold text-slate-900">Notes</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Pinned" value={stats.notes.pinned} icon={<Bookmark />} />
          <Metric
            label="Updated 7 days"
            value={stats.notes.updatedLast7Days}
            icon={<TrendingUp />}
          />
          <Metric
            label="Shared with me"
            value={stats.notes.sharedWithMe}
            icon={<Share2 />}
          />
          <Metric
            label="Shared by me"
            value={stats.notes.sharedByMe}
            icon={<Share2 />}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">Todos</h2>
        </div>
        <div className="space-y-4">
          <ProgressRow
            label="Pending"
            value={stats.todos.pending}
            total={stats.todos.total}
            className="bg-amber-500"
          />
          <ProgressRow
            label="Completed"
            value={stats.todos.completed}
            total={stats.todos.total}
            className="bg-emerald-500"
          />
          <ProgressRow
            label="Overdue"
            value={stats.todos.overdue}
            total={stats.todos.total}
            className="bg-red-500"
          />
          <ProgressRow
            label="Due today"
            value={stats.todos.dueToday}
            total={stats.todos.total}
            className="bg-primary"
          />
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="text-slate-400 [&_svg]:h-4 [&_svg]:w-4">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  className,
}: {
  label: string;
  value: number;
  total: number;
  className: string;
}) {
  const width = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${className}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
