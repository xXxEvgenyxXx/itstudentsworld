import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWishlist } from "./useWishlist";
import { api } from "@/shared/api";
import { message } from "antd";
import type { ReactNode } from "react";
import type { AxiosResponse } from "axios";

// Мокаем API
vi.mock("@/shared/api", () => ({
  api: { post: vi.fn() },
}));

describe("useWishlist", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockMessageReturn = Object.assign(
      () => {}, 
      { then: vi.fn().mockResolvedValue(true) } 
    ) as unknown as ReturnType<typeof message.success>;

    // Мокаем оба метода уведомлений, которые используются в хуке
    vi.spyOn(message, "success").mockReturnValue(mockMessageReturn);
    vi.spyOn(message, "info").mockReturnValue(mockMessageReturn);
    
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
  });

  const createWrapper = (client: QueryClient) => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={client}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  it("должен добавлять в избранное (status: added)", async () => {
    // Мокаем успешный ответ от сервера со статусом "added"
    vi.mocked(api.post).mockResolvedValueOnce({ 
      data: { status: "added" } 
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => useWishlist(), { 
      wrapper: createWrapper(queryClient) 
    });

    result.current.mutate(42);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Проверяем, что запрос улетел с правильным ID
    expect(api.post).toHaveBeenCalledWith("/wishlist/toggle", {
      cosmetic_item_id: 42,
    });

    // Проверяем, что показалось уведомление о добавлении
    expect(message.success).toHaveBeenCalledWith("Добавлено в избранное");
  });

  it("должен удалять из избранного (status: removed)", async () => {
    // Мокаем успешный ответ от сервера со статусом "removed"
    vi.mocked(api.post).mockResolvedValueOnce({ 
      data: { status: "removed" } 
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => useWishlist(), { 
      wrapper: createWrapper(queryClient) 
    });

    result.current.mutate(42);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.post).toHaveBeenCalledWith("/wishlist/toggle", {
      cosmetic_item_id: 42,
    });

    // Проверяем, что показалось уведомление об удалении (используется message.info)
    expect(message.info).toHaveBeenCalledWith("Удалено из избранного");
  });
});