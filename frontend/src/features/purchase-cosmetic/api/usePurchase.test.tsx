import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePurchase } from "./usePurchase";
import { api, API } from "@/shared/api";
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

describe("usePurchase", () => {
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

  it("должен успешно совершать покупку", async () => {
    const mockResponse = { new_balance: "1500" };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: mockResponse,
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => usePurchase(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(42);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.post).toHaveBeenCalledWith(API.wallet.purchase, {
      cosmetic_item_id: 42,
    });

    expect(message.success).toHaveBeenCalledWith(
      "Покупка успешна! Новый баланс: 1500 монет.",
    );
  });

  it("должен обрабатывать ошибку при покупке", async () => {
    const mockError = { message: "Недостаточно средств" };
    vi.mocked(api.post).mockRejectedValueOnce(mockError as unknown as Error);

    const { result } = renderHook(() => usePurchase(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(42);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(message.error).toHaveBeenCalledWith("Недостаточно средств");
  });
});
