import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdjustBalanceModal } from "./AdjustBalanceModal";
import { DATA_CY } from "@/shared/config";
import type { User } from "@/entities/user";

const mockMutate = vi.fn();
vi.mock("../api/useAdjustBalance", () => ({
  useAdjustBalance: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe("AdjustBalanceModal", () => {
  const mockUser = {
    id: 42,
    login: "Steve",
  } as User;

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockMutate.mockClear();
    mockOnClose.mockClear();
  });

  it("не должен рендериться, если пользователь не передан", () => {
    render(<AdjustBalanceModal user={null} isOpen={true} onClose={mockOnClose} />);
    expect(screen.queryByText(/Корректировка баланса/i)).toBeNull();
  });

  it("должен отображать логин пользователя в заголовке", async () => {
    render(<AdjustBalanceModal user={mockUser} isOpen={true} onClose={mockOnClose} />);
    const title = await screen.findByText(/Корректировка баланса: Steve/i);
    expect(title).toBeTruthy();
  });

  it("должен вызывать мутацию и закрываться при успешном сохранении", async () => {
    mockMutate.mockImplementationOnce((_data, options) => {
      options.onSuccess();
    });

    const user = userEvent.setup({ delay: null });
    render(<AdjustBalanceModal user={mockUser} isOpen={true} onClose={mockOnClose} />);

    const amountInput = await screen.findByTestId(DATA_CY.admin.wallet.AMOUNT_INPUT);
    await user.clear(amountInput);
    await user.type(amountInput, "150");

    const commentInput = screen.getByTestId(DATA_CY.admin.wallet.COMMENT_INPUT);
    await user.type(commentInput, "Штраф за нарушение");

    const submitBtn = screen.getByTestId(DATA_CY.admin.wallet.SUBMIT_BTN);
    await user.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 42,
        amount: 150,
        type: "accrual",
        comment: "Штраф за нарушение",
      }),
      expect.any(Object)
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("должен блокировать отправку при XSS-инъекции в поле суммы", async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdjustBalanceModal user={mockUser} isOpen={true} onClose={mockOnClose} />);

    const amountInput = await screen.findByTestId(DATA_CY.admin.wallet.AMOUNT_INPUT);
    await user.clear(amountInput);
    // Пытаемся ввести XSS. InputNumber блокирует буквы, поле остается пустым.
    await user.type(amountInput, "<script>alert(1)</script>");

    const submitBtn = screen.getByTestId(DATA_CY.admin.wallet.SUBMIT_BTN);
    await user.click(submitBtn);

    // Срабатывает required: true, так как поле пустое
    const errorMsg = await screen.findByText(/Введите сумму/i);
    expect(errorMsg).toBeTruthy();

    // Мутация не вызывается
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать отправку при SQL-инъекции в поле суммы", async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdjustBalanceModal user={mockUser} isOpen={true} onClose={mockOnClose} />);

    const amountInput = await screen.findByTestId(DATA_CY.admin.wallet.AMOUNT_INPUT);
    await user.clear(amountInput);
    await user.type(amountInput, "' OR 1=1 --");

    const submitBtn = screen.getByTestId(DATA_CY.admin.wallet.SUBMIT_BTN);
    await user.click(submitBtn);

    const errorMsg = await screen.findByText(/Введите сумму/i);
    expect(errorMsg).toBeTruthy();

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен безопасно передавать XSS-инъекцию из комментария в мутацию", async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdjustBalanceModal user={mockUser} isOpen={true} onClose={mockOnClose} />);

    const amountInput = await screen.findByTestId(DATA_CY.admin.wallet.AMOUNT_INPUT);
    await user.type(amountInput, "100");

    const commentInput = screen.getByTestId(DATA_CY.admin.wallet.COMMENT_INPUT);
    await user.type(commentInput, '<script>alert(1)</script>');

    const submitBtn = screen.getByTestId(DATA_CY.admin.wallet.SUBMIT_BTN);
    await user.click(submitBtn);

    // Обычный Input пропускает всё, но React безопасно экранирует это при рендере.
    // Строка улетает на бэкенд как есть, где Laravel её очистит.
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: '<script>alert(1)</script>',
      }),
      expect.any(Object)
    );
  });

  it("должен безопасно передавать SQL-инъекцию из комментария в мутацию", async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdjustBalanceModal user={mockUser} isOpen={true} onClose={mockOnClose} />);

    const amountInput = await screen.findByTestId(DATA_CY.admin.wallet.AMOUNT_INPUT);
    await user.type(amountInput, "100");

    const commentInput = screen.getByTestId(DATA_CY.admin.wallet.COMMENT_INPUT);
    await user.type(commentInput, "' OR 1=1 --");

    const submitBtn = screen.getByTestId(DATA_CY.admin.wallet.SUBMIT_BTN);
    await user.click(submitBtn);

    // Строка передается в мутацию, защита от SQLi лежит на бэкенде (Prepared Statements)
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: "' OR 1=1 --",
      }),
      expect.any(Object)
    );
  });
});