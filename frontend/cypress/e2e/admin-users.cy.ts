import { SELECTORS } from "../support/selectors";

describe("Admin Users Management", () => {
  let targetUserLogin: string;
  let targetUserEmail: string;
  let targetUserPassword: string;
  let targetUserId: number;

  beforeEach(() => {
    cy.loginAsOwner();
    const uniqueId = Date.now();
    targetUserLogin = `target_user_${uniqueId}`;
    targetUserEmail = `target_${uniqueId}@test.com`;
    targetUserPassword = "password123";

    cy.request({
      method: "POST",
      url: "http://localhost:8000/api/auth/register",
      body: {
        name: "Target",
        surname: "User",
        email: targetUserEmail,
        login: targetUserLogin,
        password: targetUserPassword,
        password_confirmation: targetUserPassword,
      },
    }).then((response) => {
      targetUserId = response.body.user.id;
    });

    cy.intercept("GET", "**/api/admin/users?*").as("getUsers");
    cy.visit("/admin/users");
    cy.wait("@getUsers");
  });

  it("Админ не может забанить владельца (кнопка disabled)", () => {
    cy.loginAsAdmin();
    cy.visit("/admin/users");
    cy.wait("@getUsers");

    cy.intercept("GET", "**/api/admin/users?*search=itsw_owner*").as(
      "searchOwner",
    );

    cy.get(SELECTORS.admin.users.search).type("itsw_owner");
    cy.get(SELECTORS.admin.users.searchBtn).click();
    cy.wait("@searchOwner");

    cy.get('[data-cy^="ban-btn-"]').should("be.disabled");
  });

  it("Владелец может менять роли", () => {
    cy.intercept("GET", `**/api/admin/users?*search=${targetUserLogin}*`).as(
      "searchTarget",
    );
    cy.intercept("PATCH", `**/api/admin/users/${targetUserId}/role`).as(
      "changeRole",
    );

    cy.get(SELECTORS.admin.users.search).type(targetUserLogin);
    cy.get(SELECTORS.admin.users.searchBtn).click();
    cy.wait("@searchTarget");

    cy.get(SELECTORS.admin.users.roleSelect(targetUserId)).click({
      force: true,
    });
    cy.contains(".ant-select-item-option", "Администратор").click({
      force: true,
    });

    cy.wait("@changeRole").its("response.statusCode").should("eq", 200);
    cy.wait("@getUsers");

    cy.get(SELECTORS.admin.users.roleSelect(targetUserId), {
      timeout: 10000,
    }).should("contain", "Администратор");
  });

  it("Админ может забанить обычного юзера", () => {
    cy.loginAsAdmin();
    cy.visit("/admin/users");
    cy.wait("@getUsers");

    cy.intercept("GET", `**/api/admin/users?*search=${targetUserLogin}*`).as(
      "searchTarget",
    );
    cy.intercept("PATCH", `**/api/admin/users/${targetUserId}/ban`).as(
      "banUser",
    );

    cy.get(SELECTORS.admin.users.search).type(targetUserLogin);
    cy.get(SELECTORS.admin.users.searchBtn).click();
    cy.wait("@searchTarget");

    cy.get(SELECTORS.admin.users.banBtn(targetUserId)).click();
    cy.get(".ant-popconfirm-buttons button.ant-btn-primary").click();

    cy.wait("@banUser").its("response.statusCode").should("eq", 200);
    cy.wait("@getUsers");

    cy.get(SELECTORS.admin.users.statusTag(targetUserId), {
      timeout: 10000,
    }).should("contain", "Забанен");

    cy.clearLocalStorage();

    cy.visit("/login");

    cy.get(SELECTORS.auth.loginEmail).type(targetUserEmail);
    cy.get(SELECTORS.auth.loginPassword).type(targetUserPassword);

    cy.intercept("POST", "**/api/auth/login").as("bannedLoginAttempt");

    cy.get(SELECTORS.auth.loginSubmit).click();

    cy.wait("@bannedLoginAttempt").its("response.statusCode").should("eq", 422);

    cy.get(SELECTORS.auth.errorAlert)
      .should("be.visible")
      .and("contain", "заблокирован");

    cy.url().should("include", "/login");
  });
});
