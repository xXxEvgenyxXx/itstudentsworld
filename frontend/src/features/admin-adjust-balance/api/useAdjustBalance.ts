import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import { message } from "antd";
import type { ApiException } from "@/shared/api";

interface AdjustBalancePayload {
  userId: number;
  amount: number;
  type: "accrual" | "deduction";
  comment?: string;
}

export function useAdjustBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdjustBalancePayload) => {
      const { userId, ...body } = data;
      const response = await api.post(
        `/admin/users/${userId}/wallet/adjust`,
        body,
      );
      return response.data;
    },
    onSuccess: () => {
      message.success("Баланс успешно скорректирован");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: ApiException) => {
      message.error(error.message);
    },
  });
}
