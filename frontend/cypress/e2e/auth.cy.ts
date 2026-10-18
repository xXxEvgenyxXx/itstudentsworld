import { SELECTORS } from "../support/selectors";

describe("Auth Flow & Security", () => {
  const uniqueId = Date.now();
  const testUser = {
    email: `test-${uniqueId}@example.com`,
    login: `user_${uniqueId}`,
    password: "password123",
  };

  it("Успешная регистрация, редирект в профиль и логаут", () => {
    cy.visit("/register");

    cy.get(SELECTORS.auth.regName).type("Иван");
    cy.get(SELECTORS.auth.regSurname).type("Иванов");
    cy.get(SELECTORS.auth.regEmail).type(testUser.email);
    cy.get(SELECTORS.auth.regLogin).type(testUser.login);
    cy.get(SELECTORS.auth.regPassword).type(testUser.password);
    cy.get(SELECTORS.auth.regPasswordConfirm).type(testUser.password);

    cy.get(SELECTORS.auth.regSubmit).click();

    cy.url().should("include", "/profile");
    cy.get(SELECTORS.header.username).should("contain", testUser.login);

    cy.get(SELECTORS.header.logoutBtn).click();
    cy.url().should("include", "/login");
  });

  it("Защита от SQL-инъекций (SQLi)", () => {
    cy.visit("/login");

    cy.get(SELECTORS.auth.loginEmail).type("' OR '1'='1");
    cy.get(SELECTORS.auth.loginPassword).type("' OR '1'='1");
    cy.get(SELECTORS.auth.loginSubmit).click();

    // Проверяем, что сработала клиентская валидация (AntD)
    cy.contains("Неверный формат").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("Защита от XSS-инъекций", () => {
    cy.visit("/register");
    const xssPayload = '<script>alert("hacked")</script>';

    cy.get(SELECTORS.auth.regName).type(xssPayload, {
      parseSpecialCharSequences: false,
    });
    cy.get(SELECTORS.auth.regSurname).type("Тестов");
    cy.get(SELECTORS.auth.regEmail).type(`xss-${uniqueId}@test.com`);
    cy.get(SELECTORS.auth.regLogin).type(`xss_${uniqueId}`);
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");

    cy.get(SELECTORS.auth.regSubmit).click();

    cy.on("window:alert", (str) => {
      throw new Error("Уязвимость XSS! Сработал alert: " + str);
    });

    // Если мы попали в профиль и alert не сработал — мы в безопасности
    cy.url().should("include", "/profile");
  });
  it("Ошибка при дублировании ТОЛЬКО логина", () => {
    cy.visit("/register");

    cy.get(SELECTORS.auth.regName).type("Тест");
    cy.get(SELECTORS.auth.regSurname).type("Тест");
    cy.get(SELECTORS.auth.regEmail).type(`unique-${uniqueId}@test.com`); // Уникальный email
    cy.get(SELECTORS.auth.regLogin).type("owner"); // Существующий логин
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");

    cy.get(SELECTORS.auth.regSubmit).click();

    // Ожидаем появление ошибки от API
    cy.get(SELECTORS.common.errorAlert).should("be.visible");
    cy.url().should("include", "/register"); // Остаемся на странице
  });

  it("Ошибка при дублировании ТОЛЬКО почты", () => {
    cy.visit("/register");

    cy.get(SELECTORS.auth.regName).type("Тест");
    cy.get(SELECTORS.auth.regSurname).type("Тест");
    cy.get(SELECTORS.auth.regEmail).type("itswowner@example.com"); // Существующий email
    cy.get(SELECTORS.auth.regLogin).type(`unique_login_${uniqueId}`); // Уникальный логин
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");

    cy.get(SELECTORS.auth.regSubmit).click();

    cy.get(SELECTORS.common.errorAlert).should("be.visible");
    cy.url().should("include", "/register");
  });

  it("Ошибка при дублировании и почты, и логина", () => {
    cy.visit("/register");

    cy.get(SELECTORS.auth.regName).type("Тест");
    cy.get(SELECTORS.auth.regSurname).type("Тест");
    cy.get(SELECTORS.auth.regEmail).type("itswowner@example.com"); // Существующий email
    cy.get(SELECTORS.auth.regLogin).type("owner"); // Существующий логин
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");

    cy.get(SELECTORS.auth.regSubmit).click();

    cy.get(SELECTORS.common.errorAlert).should("be.visible");
    cy.url().should("include", "/register");
  });
});
