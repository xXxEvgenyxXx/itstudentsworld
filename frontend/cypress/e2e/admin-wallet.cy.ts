import { SELECTORS } from "../support/selectors";

describe("Admin Wallet Management", () => {
  let targetUserLogin: string;
  let targetUserId: number;

  beforeEach(() => {
    cy.loginAsAdmin();
    const uniqueId = Date.now();
    targetUserLogin = `wallet_target_${uniqueId}`;

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

    cy.get(SELECTORS.admin.users.search).type(targetUserLogin);
    cy.get(SELECTORS.admin.users.searchBtn).click();
    cy.wait("@getUsers");

    cy.get(SELECTORS.admin.users.balance(targetUserId)).should(
      "contain",
      "0.00",
    );
    cy.get(SELECTORS.admin.users.walletBtn(targetUserId)).click();

    cy.get(SELECTORS.admin.wallet.typeSelect).click({ force: true });
    cy.contains(".ant-select-item-option", "Начислить").click({ force: true });

    cy.get(SELECTORS.admin.wallet.amountInput).type("500");
    cy.get(SELECTORS.admin.wallet.commentInput).type("Тестовое начисление");

    cy.get(SELECTORS.admin.wallet.submitBtn).click();

    cy.wait("@adjustBalance").its("response.statusCode").should("eq", 200);
    cy.wait("@getUsers");

    cy.get(SELECTORS.admin.users.balance(targetUserId), {
      timeout: 10000,
    }).should("contain", "500.00");
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

    cy.get(SELECTORS.admin.users.search).type(targetUserLogin);
    cy.get(SELECTORS.admin.users.searchBtn).click();
    cy.wait("@getUsers");

    cy.get(SELECTORS.admin.users.walletBtn(targetUserId)).should("not.exist");
  });

  it("Защита от XSS-инъекций в поле Комментарий", () => {
    cy.visit("/admin/users", {
      onBeforeLoad(win) {
        cy.stub(win, "alert").as("alertStub");
      },
    });
    cy.wait("@getUsers");

    cy.get(SELECTORS.admin.users.search).type(targetUserLogin);
    cy.get(SELECTORS.admin.users.searchBtn).click();
    cy.wait("@getUsers");

    cy.get(SELECTORS.admin.users.walletBtn(targetUserId)).click();

    const xssPayload = '<script>alert("hacked")</script>';
    cy.get(SELECTORS.admin.wallet.amountInput).type("100");
    cy.get(SELECTORS.admin.wallet.commentInput).type(xssPayload, {
      parseSpecialCharSequences: false,
    });

    cy.get(SELECTORS.admin.wallet.submitBtn).click();
    cy.contains("Баланс успешно скорректирован").should("be.visible");
    cy.get("@alertStub").should("not.have.been.called");
  });

  it("Защита от SQL-инъекций (SQLi) в поле Комментарий", () => {
    cy.intercept("POST", `**/api/admin/users/${targetUserId}/wallet/adjust`).as(
      "adjustBalance",
    );

    cy.get(SELECTORS.admin.users.search).type(targetUserLogin);
    cy.get(SELECTORS.admin.users.searchBtn).click();
    cy.wait("@getUsers");

    cy.get(SELECTORS.admin.users.walletBtn(targetUserId)).click();

    const sqliPayload = "' OR 1=1 --";
    cy.get(SELECTORS.admin.wallet.amountInput).type("100");
    cy.get(SELECTORS.admin.wallet.commentInput).type(sqliPayload, {
      parseSpecialCharSequences: false,
    });

    cy.get(SELECTORS.admin.wallet.submitBtn).click();

    cy.wait("@adjustBalance").its("response.statusCode").should("eq", 200);
    cy.contains("Баланс успешно скорректирован").should("be.visible");

    cy.wait("@getUsers");
    cy.get(SELECTORS.admin.users.balance(targetUserId), {
      timeout: 10000,
    }).should("contain", "100.00");
  });
});
