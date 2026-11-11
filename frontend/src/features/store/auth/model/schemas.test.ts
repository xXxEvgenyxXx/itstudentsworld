import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./schemas";

describe("Безопасность и валидация Zod-схем", () => {
  // Наборы вредоносных строк
  const xssPayloads = [
    '<script>alert("xss")</script>',
    "<img src=x onerror=alert(1)>",
    "javascript:alert(1)",
  ];

  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "admin' --",
  ];

  describe("loginSchema", () => {
    it("должна пропускать корректные данные", () => {
      const validData = { email: "test@example.com", password: "password123" };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("должна блокировать SQL-инъекции в поле email", () => {
      sqlInjectionPayloads.forEach((payload) => {
        const result = loginSchema.safeParse({
          email: payload,
          password: "password123",
        });
        expect(result.success).toBe(false);
      });
    });

    it("должна блокировать XSS-инъекции в поле email", () => {
      xssPayloads.forEach((payload) => {
        const result = loginSchema.safeParse({
          email: payload,
          password: "password123",
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("registerSchema", () => {
    const validRegisterData = {
      name: "Иван",
      surname: "Иванов",
      email: "test@example.com",
      login: "Steve_123",
      password: "password123",
      password_confirmation: "password123",
    };

    it("должна пропускать корректные данные (с кириллицей в имени)", () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it("должна блокировать XSS/SQLi в поле имени (name)", () => {
      [...xssPayloads, ...sqlInjectionPayloads].forEach((payload) => {
        const result = registerSchema.safeParse({
          ...validRegisterData,
          name: payload,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Только кириллица");
        }
      });
    });

    it("должна блокировать XSS/SQLi в поле логина (login)", () => {
      [...xssPayloads, ...sqlInjectionPayloads].forEach((payload) => {
        const result = registerSchema.safeParse({
          ...validRegisterData,
          login: payload,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "латиница, цифры и подчеркивания",
          );
        }
      });
    });

    it("должна блокировать SQLi в поле email", () => {
      sqlInjectionPayloads.forEach((payload) => {
        const result = registerSchema.safeParse({
          ...validRegisterData,
          email: payload,
        });
        expect(result.success).toBe(false);
      });
    });

    it("должна блокировать несовпадение паролей", () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password_confirmation: "different_password",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Пароли не совпадают");
      }
    });
  });
});
