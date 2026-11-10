import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DepositModal } from "./DepositModal";
import { DATA_CY } from "@/shared/config";

// Мокаем хук пополнения
const mockMutate = vi.fn();
vi.mock("../api/useDeposit", () => ({
  useDeposit: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe("DepositModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockMutate.mockClear();
    mockOnClose.mockClear();
  });

  it("должен отображать модалку и начальное значение 100", async () => {
    render(<DepositModal isOpen={true} onClose={mockOnClose} />);

    // Ждем появления заголовка модалки
    const title = await screen.findByText(/Пополнение баланса/i);
    expect(title).toBeTruthy();

    // Проверяем, что InputNumber отрендерился со значением 100
    const input = screen.getByTestId(DATA_CY.wallet.DEPOSIT_AMOUNT);
    expect(input).toHaveValue("100.00");
  });

  it("должен вызывать мутацию при клике на 'Пополнить'", async () => {
    const user = userEvent.setup({ delay: null });
    render(<DepositModal isOpen={true} onClose={mockOnClose} />);

    const input = await screen.findByTestId(DATA_CY.wallet.DEPOSIT_AMOUNT);
    await user.clear(input);
    await user.type(input, "500");

    const submitBtn = screen.getByTestId(DATA_CY.wallet.DEPOSIT_SUBMIT);
    await user.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      500,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });

  it("должен вызывать onClose при клике на 'Отмена'", async () => {
    const user = userEvent.setup({ delay: null });
    render(<DepositModal isOpen={true} onClose={mockOnClose} />);

    const cancelBtn = await screen.findByRole("button", { name: /Отмена/i });
    await user.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать XSS-инъекцию (ввод фильтруется до безопасного числа)", async () => {
    const user = userEvent.setup({ delay: null });
    render(<DepositModal isOpen={true} onClose={mockOnClose} />);

    const input = await screen.findByTestId(DATA_CY.wallet.DEPOSIT_AMOUNT);
    await user.clear(input);

    await user.type(input, '<script>alert(1)</script>');

    const submitBtn = screen.getByTestId(DATA_CY.wallet.DEPOSIT_SUBMIT);
    await user.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it("должен блокировать SQL-инъекцию (ввод фильтруется до безопасного числа)", async () => {
    const user = userEvent.setup({ delay: null });
    render(<DepositModal isOpen={true} onClose={mockOnClose} />);

    const input = await screen.findByTestId(DATA_CY.wallet.DEPOSIT_AMOUNT);
    await user.clear(input);
    
    await user.type(input, "' OR 1=1 --");

    const submitBtn = screen.getByTestId(DATA_CY.wallet.DEPOSIT_SUBMIT);
    await user.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith(11, expect.any(Object));
  });
});