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

describe("RegisterForm (Безопасность и Валидация)", () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  const renderForm = () => {
    return render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );
  };

  const fillValidData = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/Имя/i), "Иван");
    await user.type(screen.getByLabelText(/Фамилия/i), "Иванов");
    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Игровой логин/i), "Steve");
    await user.type(screen.getByLabelText(/^Пароль/i), "password123");
    await user.type(screen.getByLabelText(/Повторите пароль/i), "password123");
  };

  it("должна вызывать мутацию при валидных данных", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    await fillValidData(user);
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
  });

  it("не должна отправлять форму при XSS-инъекции в поле Имя", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/Имя/i));
    await user.type(screen.getByLabelText(/Имя/i), "<script>alert(1)</script>");
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(
      await screen.findByText(/Только кириллица, с заглавной буквы/i),
    ).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при SQL-инъекции в поле Имя", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/Имя/i));
    await user.type(screen.getByLabelText(/Имя/i), "' OR 1=1 --");
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(
      await screen.findByText(/Только кириллица, с заглавной буквы/i),
    ).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при XSS-инъекции в поле Фамилия", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/Фамилия/i));
    await user.type(
      screen.getByLabelText(/Фамилия/i),
      "<script>alert(1)</script>",
    );
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(
      await screen.findByText(/Только кириллица, с заглавной буквы/i),
    ).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при SQL-инъекции в поле Фамилия", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/Фамилия/i));
    await user.type(screen.getByLabelText(/Фамилия/i), "' OR 1=1 --");
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(
      await screen.findByText(/Только кириллица, с заглавной буквы/i),
    ).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при XSS-инъекции в поле Отчество", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.type(
      screen.getByLabelText(/Отчество/i),
      "<script>alert(1)</script>",
    );
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(
      await screen.findByText(/Только кириллица, с заглавной буквы/i),
    ).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при SQL-инъекции в поле Отчество", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.type(screen.getByLabelText(/Отчество/i), "' OR 1=1 --");
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(
      await screen.findByText(/Только кириллица, с заглавной буквы/i),
    ).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при XSS-инъекции в поле Email", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/Email/i));
    await user.type(
      screen.getByLabelText(/Email/i),
      "<script>alert(1)</script>@test.com",
    );
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(await screen.findByText(/Неверный формат/i)).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при SQL-инъекции в поле Email", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/Email/i));
    await user.type(screen.getByLabelText(/Email/i), "' OR 1=1 --");
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(await screen.findByText(/Неверный формат/i)).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при XSS-инъекции в поле Логин", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/Игровой логин/i));
    await user.type(screen.getByLabelText(/Игровой логин/i), "<script>");
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(
      await screen.findByText(/Логин должен содержать от 3 до 16 символов/i),
    ).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("не должна отправлять форму при SQL-инъекции в поле Логин", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/Игровой логин/i));
    await user.type(screen.getByLabelText(/Игровой логин/i), "' OR 1=1 --");
    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    expect(
      await screen.findByText(/Логин должен содержать от 3 до 16 символов/i),
    ).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("должна передавать XSS из поля пароль в мутацию (для последующего хеширования)", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/^Пароль/i));
    await user.type(
      screen.getByLabelText(/^Пароль/i),
      "<script>alert(1)</script>",
    );
    await user.clear(screen.getByLabelText(/Повторите пароль/i));
    await user.type(
      screen.getByLabelText(/Повторите пароль/i),
      "<script>alert(1)</script>",
    );

    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ password: "<script>alert(1)</script>" }),
        expect.any(Object),
      );
    });
  });

  it("должна передавать SQLi из поля пароль в мутацию (для последующего хеширования)", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();
    await fillValidData(user);

    await user.clear(screen.getByLabelText(/^Пароль/i));
    await user.type(screen.getByLabelText(/^Пароль/i), "' OR 1=1 --");
    await user.clear(screen.getByLabelText(/Повторите пароль/i));
    await user.type(screen.getByLabelText(/Повторите пароль/i), "' OR 1=1 --");

    await user.click(
      screen.getByRole("button", { name: /Зарегистрироваться/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ password: "' OR 1=1 --" }),
        expect.any(Object),
      );
    });
  });
});
