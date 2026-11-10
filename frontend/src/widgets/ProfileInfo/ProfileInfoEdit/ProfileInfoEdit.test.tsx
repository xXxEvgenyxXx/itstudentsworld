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

describe("ProfileInfoEdit (Безопасность и Валидация)", () => {
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

    const input = screen.getByLabelText(/Имя/i);
    await user.clear(input);
    await user.type(input, "' OR 1=1 --");

    expect(await screen.findByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
  });

  it("должен блокировать ввод XSS в поле Имя", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Имя/i);
    await user.clear(input);
    await user.type(input, "<script>alert(1)</script>");

    expect(await screen.findByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
  });

  it("должен блокировать ввод SQL-инъекции в поле Фамилия", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Фамилия/i);
    await user.clear(input);
    await user.type(input, "' OR 1=1 --");

    expect(await screen.findByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
  });

  it("должен блокировать ввод XSS в поле Фамилия", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Фамилия/i);
    await user.clear(input);
    await user.type(input, "<script>alert(1)</script>");

    expect(await screen.findByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
  });

  it("должен блокировать ввод SQL-инъекции в поле Отчество", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Отчество/i);
    await user.clear(input);
    await user.type(input, "' OR 1=1 --");

    expect(await screen.findByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
  });

  it("должен блокировать ввод XSS в поле Отчество", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Отчество/i);
    await user.clear(input);
    await user.type(input, "<script>alert(1)</script>");

    expect(await screen.findByText(/Только кириллица, с заглавной буквы/i)).toBeTruthy();
  });

  it("должен пропускать пустое поле Отчество (оно необязательное)", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Отчество/i);
    await user.clear(input);

    // Ошибки быть не должно
    expect(screen.queryByText(/Только кириллица/i)).toBeNull();
  });

  it("должен блокировать ввод SQL-инъекции в поле Email", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Email/i);
    await user.clear(input);
    await user.type(input, "' OR 1=1 --");

    expect(await screen.findByText(/Некорректный email/i)).toBeTruthy();
  });

  it("должен блокировать ввод XSS в поле Email", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Email/i);
    await user.clear(input);
    await user.type(input, "<script>alert(1)</script>@test.com");

    expect(await screen.findByText(/Некорректный email/i)).toBeTruthy();
  });

  it("должен блокировать некорректный email", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestWrapper user={mockUser} />);

    const input = screen.getByLabelText(/Email/i);
    await user.clear(input);
    await user.type(input, "invalid-email");

    expect(await screen.findByText(/Некорректный email/i)).toBeTruthy();
  });
});