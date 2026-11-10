import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PurchaseModal } from "./PurchaseModal";
import { DATA_CY } from "@/shared/config";
import type { CosmeticItem } from "@/entities/cosmetic";

// Мокаем хук покупки
const mockMutate = vi.fn();
vi.mock("../api/usePurchase", () => ({
  usePurchase: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe("PurchaseModal", () => {
  const mockItem: CosmeticItem = {
    id: 42,
    name: "Золотая шляпа",
    price: "500",
    type_id: 1,
    image_url: "/test.png", 
    deleted_at: null,
    type: {
      id: 1,
      name: "Головной убор",
      alias: "hat",
    },
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockMutate.mockClear();
    mockOnClose.mockClear();
  });

  it("не должен рендериться, если предмет не передан (item = null)", () => {
    render(
      <PurchaseModal item={null} isOpen={true} onClose={mockOnClose} />
    );
    // Текст модалки не должен появляться в DOM
    expect(screen.queryByText(/Подтверждение покупки/i)).toBeNull();
  });

  it("должен отображать название предмета и цену", async () => {
    render(
      <PurchaseModal item={mockItem} isOpen={true} onClose={mockOnClose} />
    );

    // Используем findByText, так как модалка рендерится с анимацией
    const title = await screen.findByText(/Подтверждение покупки/i);
    expect(title).toBeTruthy();

    expect(screen.getByText(/«Золотая шляпа»/i)).toBeTruthy();
    expect(screen.getByText(/500 монет/i)).toBeTruthy();
  });

  it("должен вызывать мутацию при клике на 'Купить'", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <PurchaseModal item={mockItem} isOpen={true} onClose={mockOnClose} />
    );

    // Ищем кнопку по data-cy (согласно настройке testIdAttribute)
    const confirmBtn = await screen.findByTestId(DATA_CY.shop.CONFIRM_PURCHASE);
    await user.click(confirmBtn);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      mockItem.id,
      expect.objectContaining({
        onSettled: expect.any(Function),
      })
    );
  });

  it("должен вызывать onClose при клике на 'Отмена'", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <PurchaseModal item={mockItem} isOpen={true} onClose={mockOnClose} />
    );

    const cancelBtn = await screen.findByRole("button", { name: /Отмена/i });
    await user.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockMutate).not.toHaveBeenCalled(); // Мутация не должна вызываться
  });
});