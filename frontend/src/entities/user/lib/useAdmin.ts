import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { message } from "antd";
import type { ApiException } from "@/shared/api";

export function useAdminUsers(page: number, search: string, role: string) {
  return useQuery({
    queryKey: ["admin", "users", page, search, role],
    queryFn: () => adminApi.getUsers(page, search, role),
  });
}

export function useToggleBan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.toggleBan,
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: ApiException) => message.error(error.message),
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      adminApi.changeRole(userId, role),
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: ApiException) => message.error(error.message),
  });
}
