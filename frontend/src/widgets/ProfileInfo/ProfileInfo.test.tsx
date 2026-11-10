import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileInfo } from "./ProfileInfo";
import type { User } from "@/entities/user";

// Мокаем хук обновления профиля
const mockMutate = vi.fn();
vi.mock("@/entities/user/lib/useUserProfile", () => ({
  useUpdateProfile: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe("ProfileInfo (Логика ЛК)", () => {
  const mockUser: User = {
    id: 1,
    login: "Steve",
    email: "steve@minecraft.com",
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
    role: { id: 1, alias: "user", name: "Пользователь" },
    created_at: "2023-01-01",
    is_banned: false,
  } as User;

  beforeEach(() => {
    mockMutate.mockClear();
  });

  it("должен переключаться в режим редактирования и обратно по кнопке Отмена", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);

    // В режиме просмотра нет инпутов
    expect(screen.queryByLabelText(/Имя/i)).toBeNull();
    
    // Кликаем "Редактировать"
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    // Появились поля ввода
    expect(screen.getByLabelText(/Имя/i)).toBeTruthy();
    
    // Кликаем "Отмена" (иконка крестика)
    // Ищем по data-cy, так как кнопка без текста
    await user.click(screen.getByTestId("cancel-profile-btn")); // Или getByRole, если добавишь aria-label

    // Вернулись в режим просмотра
    expect(screen.queryByLabelText(/Имя/i)).toBeNull();
  });

  it("должен блокировать сохранение при XSS-инъекции (Zod/AntD)", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);

    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const nameInput = screen.getByLabelText(/Имя/i);
    await user.clear(nameInput);
    await user.type(nameInput, '<script>alert(1)</script>');

    // Нажимаем "Сохранить" (иконка дискеты)
    await user.click(screen.getByTestId("save-profile-btn"));

    // Ждем появления ошибки (от AntD rules)
    await waitFor(() => {
      expect(screen.getByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
    });

    // Главная проверка: запрос на сервер не ушел
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен вызывать мутацию при успешном сохранении", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);

    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const nameInput = screen.getByLabelText(/Имя/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Пётр");

    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          data: expect.objectContaining({ name: "Пётр" }),
        }),
        expect.any(Object)
      );
    });
  });
});