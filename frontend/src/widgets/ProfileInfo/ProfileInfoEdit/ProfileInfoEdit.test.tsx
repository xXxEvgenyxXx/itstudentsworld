import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "antd";
import { ProfileInfoEdit } from "./ProfileInfoEdit";
import type { User } from "@/entities/user";

// Обертка для передачи инстанса формы
const TestWrapper = ({ user }: { user: User }) => {
  const [form] = Form.useForm();
  return <ProfileInfoEdit user={user} form={form} />;
};

describe("ProfileInfoEdit (Валидация полей)", () => {
  const mockUser = {
    id: 1,
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
    email: "test@example.com",
  } as User;

  it("должен блокировать ввод SQL-инъекции в поле Имя", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const nameInput = screen.getByLabelText(/Имя/i);
    await user.clear(nameInput);
    await user.type(nameInput, "' OR 1=1 --");

    // Ждем, пока AntD провалидирует ввод
    const errorMsg = await screen.findByText(/Только кириллица, с заглавной буквы/i);
    expect(errorMsg).toBeTruthy();
  });

  it("должен блокировать ввод XSS в поле Фамилия", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const surnameInput = screen.getByLabelText(/Фамилия/i);
    await user.clear(surnameInput);
    await user.type(surnameInput, "<script>alert(1)</script>");

    const errorMsg = await screen.findByText(/Только кириллица, с заглавной буквы/i);
    expect(errorMsg).toBeTruthy();
  });

  it("должен пропускать пустое поле Отчество (оно необязательное)", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const patronymicInput = screen.getByLabelText(/Отчество/i);
    await user.clear(patronymicInput);

    // Ошибки быть не должно
    expect(screen.queryByText(/Только кириллица/i)).toBeNull();
  });

  it("должен блокировать некорректный email", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const emailInput = screen.getByLabelText(/Email/i);
    await user.clear(emailInput);
    await user.type(emailInput, "invalid-email");

    const errorMsg = await screen.findByText(/Некорректный email/i);
    expect(errorMsg).toBeTruthy();
  });
});