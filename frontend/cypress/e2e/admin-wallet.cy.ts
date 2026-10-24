describe("Admin Wallet Management", () => {
  let targetUserLogin: string;
  let targetUserId: number;

  beforeEach(() => {
    cy.loginAsAdmin();
    const uniqueId = Date.now();
    targetUserLogin = `wallet_target_${uniqueId}`;

    // Создаем юзера через API (с нулевым балансом)
    cy.request({
      method: "POST",
      url: "http://localhost:8000/api/auth/register",
      body: {
        name: "Wallet",
        surname: "Target",
        email: `wallet_${uniqueId}@test.com`,
        login: targetUserLogin,
        password: "password123",
        password_confirmation: "password123",
      },
    }).then((response) => {
      targetUserId = response.body.user.id;
    });

    cy.intercept("GET", "**/api/admin/users?*").as("getUsers");
    cy.visit("/admin/users");
    cy.wait("@getUsers");
  });

  it("Админ может начислить баланс и увидеть обновление в таблице", () => {
    cy.intercept("POST", `**/api/admin/users/${targetUserId}/wallet/adjust`).as(
      "adjustBalance",
    );

    // Ищем нашего юзера
    cy.get('[data-cy="admin-users-search"]').type(targetUserLogin);
    cy.get('[data-cy="admin-users-search-btn"]').click();
    cy.wait("@getUsers");

    // Изначально баланс 0.00
    cy.get(`[data-cy="balance-${targetUserId}"]`).should("contain", "0.00");

    // Открываем модалку баланса
    cy.get(`[data-cy="wallet-btn-${targetUserId}"]`).click();

    // Заполняем форму
    cy.get('[data-cy="balance-type-select"]').click({ force: true });
    cy.contains(".ant-select-item-option", "Начислить").click({ force: true });

    cy.get('[data-cy="balance-amount-input"]').type("500");
    cy.get('[data-cy="balance-comment-input"]').type("Тестовое начисление");

    // Отправляем
    cy.get("#adjust-balance-submit").click();

    // Ждем ответа сервера
    cy.wait("@adjustBalance").its("response.statusCode").should("eq", 200);

    // Ждем обновления таблицы (invalidateQueries)
    cy.wait("@getUsers");

    cy.get(`[data-cy="balance-${targetUserId}"]`, { timeout: 10000 }).should(
      "contain",
      "500.00",
    );
  });

  it("Кнопка Баланс скрыта для забаненных пользователей", () => {
    cy.get("@adminToken").then((token) => {
      cy.request({
        method: "PATCH",
        url: `http://localhost:8000/api/admin/users/${targetUserId}/ban`,
        headers: { Authorization: `Bearer ${token}` },
      });
    });

    cy.visit("/admin/users");
    cy.wait("@getUsers");

    cy.get('[data-cy="admin-users-search"]').type(targetUserLogin);
    cy.get('[data-cy="admin-users-search-btn"]').click();
    cy.wait("@getUsers");

    cy.get(`[data-cy="wallet-btn-${targetUserId}"]`).should("not.exist");
  });

  it("Защита от XSS-инъекций в поле Комментарий", () => {
    cy.visit("/admin/users", {
      onBeforeLoad(win) {
        cy.stub(win, "alert").as("alertStub");
      },
    });
    cy.wait("@getUsers");

    cy.get('[data-cy="admin-users-search"]').type(targetUserLogin);
    cy.get('[data-cy="admin-users-search-btn"]').click();
    cy.wait("@getUsers");

    cy.get(`[data-cy="wallet-btn-${targetUserId}"]`).click();

    const xssPayload = '<script>alert("hacked")</script>';
    cy.get('[data-cy="balance-amount-input"]').type("100");
    cy.get('[data-cy="balance-comment-input"]').type(xssPayload, {
      parseSpecialCharSequences: false,
    });

    cy.get("#adjust-balance-submit").click();

    cy.contains("Баланс успешно скорректирован").should("be.visible");

    cy.get("@alertStub").should("not.have.been.called");
  });

  it("Защита от SQL-инъекций (SQLi) в поле Комментарий", () => {
    cy.intercept("POST", `**/api/admin/users/${targetUserId}/wallet/adjust`).as(
      "adjustBalance",
    );

    cy.get('[data-cy="admin-users-search"]').type(targetUserLogin);
    cy.get('[data-cy="admin-users-search-btn"]').click();
    cy.wait("@getUsers");

    cy.get(`[data-cy="wallet-btn-${targetUserId}"]`).click();

    const sqliPayload = "' OR 1=1 --";
    cy.get('[data-cy="balance-amount-input"]').type("100");
    cy.get('[data-cy="balance-comment-input"]').type(sqliPayload, {
      parseSpecialCharSequences: false,
    });

    cy.get("#adjust-balance-submit").click();

    cy.wait("@adjustBalance").its("response.statusCode").should("eq", 200);

    cy.contains("Баланс успешно скорректирован").should("be.visible");

    cy.wait("@getUsers");
    cy.get(`[data-cy="balance-${targetUserId}"]`, { timeout: 10000 }).should(
      "contain",
      "100.00",
    );
  });
});
