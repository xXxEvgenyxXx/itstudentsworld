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

  it("Защита от XSS-инъекций", () => {
    const xssPayload = '<script>alert("hacked")</script>';

    cy.visit("/register", {
      onBeforeLoad(win) {
        cy.stub(win, "alert").as("alertStub");
      },
    });

    cy.intercept("POST", "**/api/auth/register").as("xssRegisterRequest");

    cy.get(SELECTORS.auth.regName).type(xssPayload, {
      parseSpecialCharSequences: false,
    });
    cy.get(SELECTORS.auth.regSurname).type("Тестов");
    cy.get(SELECTORS.auth.regEmail).type(`xss-${Date.now()}@test.com`);
    cy.get(SELECTORS.auth.regLogin).type(`xss_${Date.now()}`);
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");
    cy.get(SELECTORS.auth.regSubmit).click();

    cy.wait("@xssRegisterRequest").its("response.statusCode").should("eq", 201);
    cy.url({ timeout: 10000 }).should("include", "/profile");

    cy.get("@alertStub").should("not.have.been.called");
    cy.contains(xssPayload).should("be.visible");
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
    cy.get(SELECTORS.common.errorAlert).should("be.visible");
    cy.url().should("include", "/register");
  });

  it("Ошибка при дублировании ТОЛЬКО почты", () => {
    cy.visit("/register");
    cy.intercept("POST", "**/api/auth/register").as("registerRequest");

    cy.get(SELECTORS.auth.regName).type("Тест");
    cy.get(SELECTORS.auth.regSurname).type("Тест");
    cy.get(SELECTORS.auth.regEmail).type("itswowner@example.com");
    cy.get(SELECTORS.auth.regLogin).type(`unique_login_${uniqueId}`);
    cy.get(SELECTORS.auth.regPassword).type("password123");
    cy.get(SELECTORS.auth.regPasswordConfirm).type("password123");
    cy.get(SELECTORS.auth.regSubmit).click();

    cy.wait("@registerRequest").its("response.statusCode").should("eq", 422);
    cy.get(SELECTORS.common.errorAlert).should("be.visible");
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
    cy.get(SELECTORS.common.errorAlert).should("be.visible");
    cy.url().should("include", "/register");
  });
});
