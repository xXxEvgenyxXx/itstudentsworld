import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "./RegisterForm";
import { MemoryRouter } from "react-router-dom";

const mockMutate = vi.fn();
vi.mock("@/entities/user", () => ({
  useRegister: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock("@/shared/api", () => ({
  parseApiError: vi.fn(),
}));

describe("RegisterForm (Безопасность)", () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  const renderForm = () => {
    return render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
  };

  it("не должна отправлять форму при XSS-инъекции в поле Имя", async () => {
    const user = userEvent.setup({ delay: null }); 
    renderForm();

    await user.type(screen.getByLabelText(/Фамилия/i), "Иванов");
    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Игровой логин/i), "Steve");
    await user.type(screen.getByLabelText(/^Пароль/i), "password123");
    await user.type(screen.getByLabelText(/Повторите пароль/i), "password123");

    await user.type(screen.getByLabelText(/Имя/i), '<script>alert(1)</script>');
    await user.click(screen.getByRole("button", { name: /Зарегистрироваться/i }));

    await waitFor(() => {
      expect(screen.getByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  }, 10000);

  it("не должна отправлять форму при SQL-инъекции в поле Логин", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText(/Имя/i), "Иван");
    await user.type(screen.getByLabelText(/Фамилия/i), "Иванов");
    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^Пароль/i), "password123");
    await user.type(screen.getByLabelText(/Повторите пароль/i), "password123");

    await user.type(screen.getByLabelText(/Игровой логин/i), "' OR 1=1 --");
    await user.click(screen.getByRole("button", { name: /Зарегистрироваться/i }));

    await waitFor(() => {
      expect(screen.getByText(/Логин должен содержать от 3 до 16 символов/i)).toBeTruthy();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  }, 10000);

  it("должна вызывать мутацию при валидных данных", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.type(screen.getByLabelText(/Имя/i), "Иван");
    await user.type(screen.getByLabelText(/Фамилия/i), "Иванов");
    await user.type(screen.getByLabelText(/Email/i), "valid@test.com");
    await user.type(screen.getByLabelText(/Игровой логин/i), "ValidLogin");
    await user.type(screen.getByLabelText(/^Пароль/i), "password123");
    await user.type(screen.getByLabelText(/Повторите пароль/i), "password123");

    await user.click(screen.getByRole("button", { name: /Зарегистрироваться/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
  }, 10000);
});