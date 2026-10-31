import { SELECTORS } from "../support/selectors";
import { generateLogin, generateEmail } from "../support/utils";

describe("Auth Flow & Security", () => {
  const uniqueId = Date.now();
  const testUser = {
    email: generateEmail("auth"),
    login: generateLogin("aut"),
    password: "password123",
  };

  it("Успешная регистрация, редирект в профиль и логаут", () => {
    cy.visit("/register");
    cy.intercept("POST", "**/api/auth/register").as("registerRequest");

    cy.get(SELECTORS.auth.regName).type("Иван");
    cy.get(SELECTORS.auth.regSurname).type("Иванов");
    cy.get(SELECTORS.auth.regEmail).type(testUser.email);
    cy.get(SELECTORS.auth.regLogin).type(testUser.login);
    cy.get(SELECTORS.auth.regPassword).type(testUser.password);
    cy.get(SELECTORS.auth.regPasswordConfirm).type(testUser.password);
    cy.get(SELECTORS.auth.regSubmit).click();

    cy.wait("@registerRequest").its("response.statusCode").should("eq", 201);
    cy.url().should("include", "/profile");
    cy.get(SELECTORS.header.username).should("contain", testUser.login);

    cy.intercept("POST", "**/api/auth/logout").as("logoutRequest");
    cy.get(SELECTORS.header.logoutBtn).click();
    cy.wait("@logoutRequest");
    cy.url().should("include", "/login");
  });

  it("Защита от SQL-инъекций (SQLi)", () => {
    cy.visit("/login");
    cy.get(SELECTORS.auth.loginEmail).type("' OR '1'='1");
    cy.get(SELECTORS.auth.loginPassword).type("' OR '1'='1");
    cy.get(SELECTORS.auth.loginSubmit).click();

    cy.contains("Неверный формат").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("Защита от XSS-инъекций (UI блокирует ввод)", () => {
    const xssPayload = '<script>alert("hacked")</script>';

    cy.visit("/register");
    cy.intercept("POST", "**/api/auth/register").as("registerRequest");

    cy.get(SELECTORS.auth.regName).type(xssPayload, {
      parseSpecialCharSequences: false,
    });
    cy.get(SELECTORS.auth.regSurname).type("Тестов");
    cy.get(SELECTORS.auth.regEmail).type(generateEmail("xss"));
    cy.get(SELECTORS.auth.regLogin).type(generateLogin("xss"));
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");

    cy.get(SELECTORS.auth.regSubmit).click();

    cy.get(SELECTORS.auth.regNameWrapper).should(
      "contain",
      "Только кириллица, с заглавной буквы",
    );

    cy.get("@registerRequest.all").should("have.length", 0);

    cy.url().should("include", "/register");
  });

  it("Ошибка при дублировании ТОЛЬКО логина", () => {
    cy.visit("/register");
    cy.intercept("POST", "**/api/auth/register").as("registerRequest");

    cy.get(SELECTORS.auth.regName).type("Тест");
    cy.get(SELECTORS.auth.regSurname).type("Тест");
    cy.get(SELECTORS.auth.regEmail).type(`unique-${uniqueId}@test.com`);
    cy.get(SELECTORS.auth.regLogin).type("owner");
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");
    cy.get(SELECTORS.auth.regSubmit).click();

    cy.wait("@registerRequest").its("response.statusCode").should("eq", 422);
    cy.get(SELECTORS.auth.errorAlert).should("be.visible");
    cy.url().should("include", "/register");
  });

  it("Ошибка при дублировании ТОЛЬКО почты", () => {
    const uniqueLogin = generateLogin("unique");

    cy.visit("/register");
    cy.intercept("POST", "**/api/auth/register").as("registerRequest");

    cy.get(SELECTORS.auth.regName).type("Тест");
    cy.get(SELECTORS.auth.regSurname).type("Тест");
    cy.get(SELECTORS.auth.regEmail).type("itswowner@example.com");
    cy.get(SELECTORS.auth.regLogin).type(uniqueLogin);
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");
    cy.get(SELECTORS.auth.regSubmit).click();

    cy.wait("@registerRequest").its("response.statusCode").should("eq", 422);
    cy.get(SELECTORS.auth.errorAlert).should("be.visible");
    cy.url().should("include", "/register");
  });

  it("Ошибка при дублировании и почты, и логина", () => {
    cy.visit("/register");
    cy.intercept("POST", "**/api/auth/register").as("registerRequest");

    cy.get(SELECTORS.auth.regName).type("Тест");
    cy.get(SELECTORS.auth.regSurname).type("Тест");
    cy.get(SELECTORS.auth.regEmail).type("itswowner@example.com");
    cy.get(SELECTORS.auth.regLogin).type("owner");
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");
    cy.get(SELECTORS.auth.regSubmit).click();

    cy.wait("@registerRequest").its("response.statusCode").should("eq", 422);
    cy.get(SELECTORS.auth.errorAlert).should("be.visible");
    cy.url().should("include", "/register");
  });
});
