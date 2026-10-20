import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import { message } from "antd";

export function useWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cosmeticId: number) => {
      const { data } = await api.post("/wishlist/toggle", {
        cosmetic_item_id: cosmeticId,
      });
      return data;
    },
    onSuccess: (data) => {
      // Обновляем данные профиля, чтобы в ЛК сразу отобразилось изменение
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (data.status === "added") message.success("Добавлено в избранное");
      if (data.status === "removed") message.info("Удалено из избранного");
    },
  });
}
