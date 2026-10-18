import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api";
import { useAuthStore } from "../store";

export function useMe() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.fetchMe,
    enabled: !!token, // Не делаем запрос, если токена нет
    retry: false, // 401 ошибку не ретраим (нечего пытаться)
    staleTime: 5 * 60 * 1000, // Считаем данные свежими 5 минут
  });
}
