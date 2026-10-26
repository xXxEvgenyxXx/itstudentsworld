import { SELECTORS } from "../support/selectors";

describe("User Profile Management", () => {
  beforeEach(() => {
    cy.loginAsUser();
    cy.visit("/profile");
  });

  it("Пользователь может успешно отредактировать свой профиль", () => {
    cy.get(SELECTORS.profile.editBtn).click();

    cy.get(SELECTORS.profile.editName).clear().type("НовоеИмя");
    cy.get(SELECTORS.profile.editSurname).clear().type("НоваяФамилия");

    cy.intercept("PATCH", "**/api/users/*").as("updateProfile");
    cy.get(SELECTORS.profile.saveBtn).click();

    cy.wait("@updateProfile").its("response.statusCode").should("eq", 200);
    cy.contains("Профиль успешно обновлен").should("be.visible");

    cy.get(SELECTORS.profile.editName).should("not.exist");
    cy.contains("НовоеИмя").should("be.visible");
  });

  it("Пользователь может отменить редактирование профиля", () => {
    cy.get(SELECTORS.profile.editBtn).click();
    cy.get(SELECTORS.profile.editName).clear().type("ТекстКоторыйСотрется");
    cy.get(SELECTORS.profile.cancelBtn).click();

    cy.get(SELECTORS.profile.editName).should("not.exist");
    cy.contains("ТекстКоторыйСотрется").should("not.exist");
  });

  it("Защита от XSS-инъекций при редактировании профиля", () => {
    const xssPayload = '<script>alert("hacked")</script>';

    cy.visit("/profile", {
      onBeforeLoad(win) {
        cy.stub(win, "alert").as("alertStub");
      },
    });

    cy.get(SELECTORS.profile.editBtn).click();
    cy.get(SELECTORS.profile.editName).clear().type(xssPayload, { parseSpecialCharSequences: false });

    cy.intercept("PATCH", "**/api/users/*").as("updateProfile");
    cy.get(SELECTORS.profile.saveBtn).click();

    cy.wait("@updateProfile").its("response.statusCode").should("eq", 200);
    cy.get("@alertStub").should("not.have.been.called");
    cy.get(SELECTORS.profile.editName).should("not.exist");
    cy.contains(xssPayload).should("be.visible");
  });

  it("Защита от SQL-инъекций при редактировании профиля (UI)", () => {
    const sqliPayload = "' OR 1=1 --";

    cy.get(SELECTORS.profile.editBtn).click();
    cy.get(SELECTORS.profile.editName).clear().type(sqliPayload, { parseSpecialCharSequences: false });

    cy.intercept("PATCH", "**/api/users/*").as("updateProfile");
    cy.get(SELECTORS.profile.saveBtn).click();

    cy.wait("@updateProfile").its("response.statusCode").should("eq", 200);
    cy.contains(sqliPayload).should("be.visible");
  });

  it("Пользователь может пополнить баланс", () => {
    cy.get(SELECTORS.wallet.balance).invoke("text").then((initialBalance) => {
      cy.get(SELECTORS.wallet.openDepositBtn).click();
      cy.get(SELECTORS.wallet.depositAmount).clear().type("500");

      cy.intercept("POST", "**/api/wallet/deposit").as("depositRequest");
      cy.get(SELECTORS.wallet.depositSubmit).click();

      cy.wait("@depositRequest").its("response.statusCode").should("eq", 200);
      cy.contains("Баланс успешно пополнен").should("be.visible");

      cy.get(SELECTORS.wallet.balance, { timeout: 10000 }).should(($newBalance) => {
        const newBalanceText = $newBalance.text().replace(/\s/g, "").replace(",", "");
        const initialText = initialBalance.replace(/\s/g, "").replace(",", "");
        expect(Number(newBalanceText)).to.be.greaterThan(Number(initialText));
      });
    });
  });
});