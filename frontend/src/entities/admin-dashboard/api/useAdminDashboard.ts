import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "./adminDashboardApi";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => getAdminDashboard(),
  });
}