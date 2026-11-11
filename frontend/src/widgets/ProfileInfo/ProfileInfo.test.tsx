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

describe("ProfileInfo (Логика ЛК и Безопасность)", () => {
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

  it("должен блокировать сохранение при XSS-инъекции в поле Имя", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const nameInput = screen.getByLabelText(/Имя/i);
    await user.clear(nameInput);
    await user.type(nameInput, '<script>alert(1)</script>');
    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать сохранение при SQL-инъекции в поле Имя", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const nameInput = screen.getByLabelText(/Имя/i);
    await user.clear(nameInput);
    await user.type(nameInput, "' OR 1=1 --");
    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать сохранение при XSS-инъекции в поле Фамилия", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const input = screen.getByLabelText(/Фамилия/i);
    await user.clear(input);
    await user.type(input, '<img src=x onerror=alert(1)>');
    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать сохранение при SQL-инъекции в поле Фамилия", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const input = screen.getByLabelText(/Фамилия/i);
    await user.clear(input);
    await user.type(input, "' OR 1=1 --");
    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать сохранение при XSS-инъекции в поле Отчество", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const input = screen.getByLabelText(/Отчество/i);
    await user.clear(input);
    await user.type(input, '<script>alert(1)</script>');
    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать сохранение при SQL-инъекции в поле Отчество", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const input = screen.getByLabelText(/Отчество/i);
    await user.clear(input);
    await user.type(input, "' OR 1=1 --");
    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать сохранение при XSS-инъекции в поле Email", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const input = screen.getByLabelText(/Email/i);
    await user.clear(input);
    await user.type(input, '<script>alert(1)</script>@test.com');
    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Некорректный email/i)).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должен блокировать сохранение при SQL-инъекции в поле Email", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ProfileInfo user={mockUser} />);
    await user.click(screen.getByRole("button", { name: /Редактировать/i }));

    const input = screen.getByLabelText(/Email/i);
    await user.clear(input);
    await user.type(input, "' OR 1=1 --@test.com");
    await user.click(screen.getByTestId("save-profile-btn"));

    await waitFor(() => {
      expect(screen.getByText(/Некорректный email/i)).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });
});