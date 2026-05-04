import { request } from "@/app/lib/api";
import type { DashboardStats } from "@/app/types/dashboard.types";

export const dashboardService = {
  getStats(): Promise<DashboardStats> {
    return request<DashboardStats>("/dashboard/stats");
  },
};
