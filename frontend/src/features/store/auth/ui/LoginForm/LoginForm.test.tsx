import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginForm } from "./LoginForm";

// Мокаем хук авторизации
const mockMutate = vi.fn();
vi.mock("@/entities/user", () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

// Мокаем хук навигации (React Router)
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }), // Имитируем, что пользователь пришел не из ProtectedRoute
  };
});

// Мокаем парсер ошибок API
vi.mock("@/shared/api", () => ({
  parseApiError: vi.fn(() => ({ message: "Неверный email или пароль" })),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockNavigate.mockClear();
  });

  const renderForm = () => {
    return render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
  };

  it("должна отправлять форму при валидных данных", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Пароль/i), "password123");

    await user.click(screen.getByRole("button", { name: /Войти/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        { email: "test@example.com", password: "password123" },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it("не должна отправлять форму при XSS-инъекции в Email", async () => {
    const user = userEvent.setup();
    renderForm();

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, '<script>alert("xss")</script>');
    await user.type(screen.getByLabelText(/Пароль/i), "password123");

    await user.click(screen.getByRole("button", { name: /Войти/i }));

    // Ожидаем, что Ant Design / Zod выдаст ошибку формата
    await waitFor(() => {
      expect(screen.getByText(/Неверный формат/i)).toBeTruthy();
    });

    // Главная проверка: запрос на сервер не улетел
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при SQL-инъекции в Email", async () => {
    const user = userEvent.setup();
    renderForm();

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, "' OR '1'='1");
    await user.type(screen.getByLabelText(/Пароль/i), "password123");

    await user.click(screen.getByRole("button", { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText(/Неверный формат/i)).toBeTruthy();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при коротком пароле", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    // Вводим пароль короче 8 символов
    await user.type(screen.getByLabelText(/Пароль/i), "123");

    await user.click(screen.getByRole("button", { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText(/Пароль должен быть не менее 8 символов/i)).toBeTruthy();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должна отображать ошибку, если сервер вернул ошибку (onError)", async () => {
    const user = userEvent.setup();
    
    // Настраиваем мок так, чтобы он вызывал onError
    mockMutate.mockImplementationOnce((_values, options) => {
      options.onError(new Error("API Error"));
    });

    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/Пароль/i), "password123");
    await user.click(screen.getByRole("button", { name: /Войти/i }));

    // Проверяем, что появился Alert с сообщением из parseApiError
    await waitFor(() => {
      expect(screen.getByText("Неверный email или пароль")).toBeTruthy();
    });
  });
});