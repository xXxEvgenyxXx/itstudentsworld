import { api } from "@/shared/api";
import type { AdminDashboardResponse } from "../model/types";

export async function getAdminDashboard() {
  const { data } = await api.get<AdminDashboardResponse>("/admin/dashboard");
  return data;
}