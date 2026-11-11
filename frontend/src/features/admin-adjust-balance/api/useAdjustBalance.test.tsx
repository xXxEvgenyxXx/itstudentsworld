import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAdjustBalance } from "./useAdjustBalance";
import { api } from "@/shared/api";
import { message } from "antd";
import type { ReactNode } from "react";
import type { AxiosResponse } from "axios";

vi.mock("@/shared/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api")>();
  return {
    ...actual,
    api: { post: vi.fn() },
  };
});

describe("useAdjustBalance", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

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

  it("должен успешно корректировать баланс", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { message: "OK" },
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => useAdjustBalance(), {
      wrapper: createWrapper(queryClient),
    });

    const payload = {
      userId: 10,
      amount: 500,
      type: "accrual" as const,
      comment: "Бонус",
    };
    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Проверяем URL и тело запроса (userId забирается из data, остальное летит в body)
    expect(api.post).toHaveBeenCalledWith("/admin/users/10/wallet/adjust", {
      amount: 500,
      type: "accrual",
      comment: "Бонус",
    });

    expect(message.success).toHaveBeenCalledWith(
      "Баланс успешно скорректирован",
    );
  });

  it("должен обрабатывать ошибку при корректировке", async () => {
    const mockError = { message: "Недостаточно прав" };
    vi.mocked(api.post).mockRejectedValueOnce(mockError as unknown as Error);

    const { result } = renderHook(() => useAdjustBalance(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ userId: 10, amount: 500, type: "accrual" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(message.error).toHaveBeenCalledWith("Недостаточно прав");
  });
});
