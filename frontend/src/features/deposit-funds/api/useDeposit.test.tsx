import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeposit } from "./useDeposit";
import { api, API } from "@/shared/api";
import { message } from "antd";
import type { ReactNode } from "react";
import type { AxiosResponse } from "axios";

// Используем importOriginal, чтобы сохранить API
vi.mock("@/shared/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api")>();
  return {
    ...actual,
    api: { post: vi.fn() },
  };
});

describe("useDeposit", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // Мокаем message с типами
    const mockMessageReturn = Object.assign(() => {}, {
      then: vi.fn().mockResolvedValue(true),
    }) as unknown as ReturnType<typeof message.success>;

    vi.spyOn(message, "success").mockReturnValue(mockMessageReturn);
    vi.spyOn(message, "error").mockReturnValue(mockMessageReturn);

    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
  });

  const createWrapper = (client: QueryClient) => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
    };
  };

  it("должен успешно пополнять баланс", async () => {
    // Мокаем ответ от сервера (внутри транзакции лежит amount)
    const mockResponse = {
      transaction: { amount: "500" },
    };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: mockResponse,
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => useDeposit(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(500);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Проверяем вызов API
    expect(api.post).toHaveBeenCalledWith(API.wallet.deposit, { amount: 500 });

    // Проверяем уведомление
    expect(message.success).toHaveBeenCalledWith(
      "Баланс успешно пополнен на 500 монет!",
    );
  });

  it("должен обрабатывать ошибку при пополнении", async () => {
    const mockError = { message: "Ошибка платежного шлюза" };
    vi.mocked(api.post).mockRejectedValueOnce(mockError as unknown as Error);

    const { result } = renderHook(() => useDeposit(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(500);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(message.error).toHaveBeenCalledWith("Ошибка платежного шлюза");
  });
});
