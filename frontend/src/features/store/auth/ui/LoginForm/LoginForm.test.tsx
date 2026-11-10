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
    useLocation: () => ({ state: null }),
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
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Пароль/i), "password123");
    await user.click(screen.getByRole("button", { name: /Войти/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
  });

  it("не должна отправлять форму при XSS-инъекции в Email", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText(/Email/i), '<script>alert("xss")</script>');
    await user.type(screen.getByLabelText(/Пароль/i), "password123");
    await user.click(screen.getByRole("button", { name: /Войти/i }));

    expect(await screen.findByText(/Неверный формат/i)).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при SQL-инъекции в Email", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "' OR '1'='1");
    await user.type(screen.getByLabelText(/Пароль/i), "password123");
    await user.click(screen.getByRole("button", { name: /Войти/i }));

    expect(await screen.findByText(/Неверный формат/i)).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при коротком пароле", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Пароль/i), "123");
    await user.click(screen.getByRole("button", { name: /Войти/i }));

    expect(await screen.findByText(/Пароль должен быть не менее 8 символов/i)).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должна передавать XSS из поля пароль в мутацию", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Пароль/i), '<script>alert(1)</script>');
    await user.click(screen.getByRole("button", { name: /Войти/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ password: '<script>alert(1)</script>' }),
        expect.any(Object)
      );
    });
  });

  it("должна передавать SQLi из поля пароль в мутацию", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Пароль/i), "' OR 1=1 --");
    await user.click(screen.getByRole("button", { name: /Войти/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ password: "' OR 1=1 --" }),
        expect.any(Object)
      );
    });
  });

  it("должна отображать ошибку, если сервер вернул ошибку (onError)", async () => {
    const user = userEvent.setup({ delay: null });
    
    mockMutate.mockImplementationOnce((_values, options) => {
      options.onError(new Error("API Error"));
    });

    renderForm();

    await user.type(screen.getByLabelText(/Email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/Пароль/i), "password123");
    await user.click(screen.getByRole("button", { name: /Войти/i }));

    expect(await screen.findByText("Неверный email или пароль")).toBeTruthy();
  });
});