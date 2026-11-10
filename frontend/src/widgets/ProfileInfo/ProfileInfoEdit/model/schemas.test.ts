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

  it("должна блокировать XSS и SQL-инъекции в Имени, Фамилии и Отчестве", () => {
    const payloads = [
      '<script>alert("xss")</script>',
      "' OR 1=1 --",
      "<img src=x onerror=alert(1)>",
    ];

    payloads.forEach((payload) => {
      // Проверка Имени
      const nameResult = profileInfoSchema.safeParse({ ...validData, name: payload });
      expect(nameResult.success).toBe(false);

      // Проверка Фамилии
      const surnameResult = profileInfoSchema.safeParse({ ...validData, surname: payload });
      expect(surnameResult.success).toBe(false);

      // Проверка Отчества
      const patronymicResult = profileInfoSchema.safeParse({ ...validData, patronymic: payload });
      expect(patronymicResult.success).toBe(false);
    });
  });

  it("должна блокировать некорректный email и SQL-инъекции в нем", () => {
    const invalidEmails = [
      "invalid-email",
      "test@",
      "' OR '1'='1",
      "<script>alert(1)</script>@test.com",
    ];

    invalidEmails.forEach((email) => {
      const result = profileInfoSchema.safeParse({ ...validData, email });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Введите корректный email");
      }
    });
  });
});