"use client";

import { useQuery } from "@tanstack/react-query";
import WelcomeSection from "@/app/components/home/WelcomeSection";
import RecentNotesTable from "@/app/components/home/RecentNotesTable";
import TopicOverview from "@/app/components/home/TopicOverview";
import QuickActions from "@/app/components/home/QuickActions";
import { dashboardService } from "@/app/services/dashboard.service";
import type { DashboardStats } from "@/app/types/dashboard.types";

export default function DashboardClient() {
  const statsQuery = useQuery<DashboardStats, Error>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30 * 1000,
  });

  if (statsQuery.isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-20 rounded-lg bg-white border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-lg bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 rounded-lg bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (statsQuery.error || !statsQuery.data) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {statsQuery.error?.message || "Failed to load dashboard stats."}
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <WelcomeSection stats={stats} />
      <TopicOverview stats={stats} />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <RecentNotesTable notes={stats.activity.recentNotes} />
        <QuickActions stats={stats} />
      </div>
    </div>
  );
}
