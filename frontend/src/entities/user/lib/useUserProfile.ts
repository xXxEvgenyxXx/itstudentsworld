import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/userApi";
import { message } from "antd";
import type { ApiException } from "@/shared/api";
import type { User } from "../model/types";
import { useAuthStore } from "../store/useAuthStore";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: Partial<User> }) =>
      userApi.updateProfile(userId, data),
    onSuccess: (response) => {
      message.success("Профиль успешно обновлен");
      setUser(response.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error: ApiException) => {
      message.error(error.message);
    },
  });
}

export function useTransactions(userId: number | undefined) {
  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => userApi.getTransactions(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}
