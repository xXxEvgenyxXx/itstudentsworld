import { describe, it, expect } from "vitest";
import { profileInfoSchema } from "./schemas";

describe("profileInfoSchema (Валидация Zod)", () => {
  const validData = {
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
    email: "test@example.com",
  };

  it("должна пропускать корректные данные", () => {
    const result = profileInfoSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("должна пропускать пустое отчество", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      patronymic: "", // Пустая строка разрешена
    });
    expect(result.success).toBe(true);
  });

  it("должна пропускать, если отчество вообще не передано (undefined)", () => {
    const { ...dataWithoutPatronymic } = validData;
    const result = profileInfoSchema.safeParse(dataWithoutPatronymic);
    expect(result.success).toBe(true);
  });

  it("должна блокировать слишком короткое имя или фамилию", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      name: "И", // 1 символ
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Имя слишком короткое");
    }
  });

  it("должна блокировать XSS-инъекцию в поле Имя", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      name: '<script>alert("xss")</script>',
    });
    expect(result.success).toBe(false);
  });

  it("должна блокировать SQL-инъекцию в поле Имя", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      name: "' OR 1=1 --",
    });
    expect(result.success).toBe(false);
  });

  it("должна блокировать XSS-инъекцию в поле Фамилия", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      surname: '<img src=x onerror=alert(1)>',
    });
    expect(result.success).toBe(false);
  });

  it("должна блокировать SQL-инъекцию в поле Фамилия", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      surname: "' OR 1=1 --",
    });
    expect(result.success).toBe(false);
  });

  it("должна блокировать XSS-инъекцию в поле Отчество", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      patronymic: '<script>alert("xss")</script>',
    });
    expect(result.success).toBe(false);
  });

  it("должна блокировать SQL-инъекцию в поле Отчество", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      patronymic: "' OR 1=1 --",
    });
    expect(result.success).toBe(false);
  });

  it("должна блокировать некорректный формат email", () => {
    const invalidEmails = ["invalid-email", "test@", "user@.com"];

    invalidEmails.forEach((email) => {
      const result = profileInfoSchema.safeParse({ ...validData, email });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Введите корректный email");
      }
    });
  });

  it("должна блокировать XSS-инъекцию в поле Email", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      email: '<script>alert(1)</script>@test.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Введите корректный email");
    }
  });

  it("должна блокировать SQL-инъекцию в поле Email", () => {
    const result = profileInfoSchema.safeParse({
      ...validData,
      email: "' OR '1'='1'@test.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Введите корректный email");
    }
  });
});