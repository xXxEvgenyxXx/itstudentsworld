import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, API } from "@/shared/api";
import { message } from "antd";
import type { ApiException } from "@/shared/api";

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const { data } = await api.post(API.wallet.deposit, { amount });
      return data;
    },
    onSuccess: (data) => {
      message.success(
        `Баланс успешно пополнен на ${data.transaction.amount} монет!`,
      );
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error: ApiException) => {
      message.error(error.message);
    },
  });
}
