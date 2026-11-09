import { SELECTORS } from "../support/selectors";
import { generateEmail, generateLogin } from "cypress/support/utils";

describe("Shop & Wishlist Flow", () => {
  beforeEach(() => {
    const email = generateEmail("shop");
    const login = generateLogin("shop");
    const password = "password123";

    cy.request("POST", "http://localhost:8000/api/auth/register", {
      name: "Шоп",
      surname: "Тест",
      email: email,
      login: login,
      password: password,
      password_confirmation: password,
    }).then((response) => {
      const token = response.body.token;

      cy.request({
        method: "POST",
        url: "http://localhost:8000/api/wallet/deposit",
        headers: { Authorization: `Bearer ${token}` },
        body: { amount: 5000 },
      });

      window.localStorage.setItem("itsw_token", token);
      window.localStorage.setItem(
        "itsw_auth",
        JSON.stringify({
          state: { user: response.body.user, token },
          version: 0,
        }),
      );
    });
  });

  it("Успешная покупка предмета и скрытие кнопки", () => {
    cy.visit("/shop");
    cy.intercept("POST", "**/api/wallet/purchase").as("purchaseRequest");
    cy.intercept("GET", "**/api/auth/me").as("getUser");

    cy.get('[data-cy^="buy-btn-"]').first().then(($btn) => {
      const btnDataCy = $btn.attr("data-cy");
      
      if (!btnDataCy) throw new Error("Кнопка не имеет атрибута data-cy");

      cy.wrap($btn).click();
      
      cy.get(SELECTORS.shop.confirmPurchase).click();

      cy.wait("@purchaseRequest").its("response.statusCode").should("eq", 201);
      cy.wait("@getUser");

      cy.get(`[data-cy="${btnDataCy}"]`).should("not.exist");
      
      cy.get('[data-cy^="buy-btn-"]').should("have.length.at.least", 1);
    });
  });

  it("Добавление в избранное и проверка перезагрузки", () => {
    cy.visit("/shop");
    cy.intercept("POST", "**/api/wishlist/toggle").as("wishlistRequest");

    cy.get(SELECTORS.shop.anyWishlistBtn).first().as("heartButton");
    cy.get("@heartButton").click();

    cy.wait("@wishlistRequest").its("response.statusCode").should("eq", 200);
    cy.reload();

    cy.get(SELECTORS.shop.anyWishlistActiveBtn).should("exist");

    cy.visit("/profile");

    cy.get(SELECTORS.profile.tabWishlist).click();
    cy.get(SELECTORS.wishlist.item).should("have.length.at.least", 1);
  });

  it("Ошибка при попытке покупки без денег", () => {
    cy.clearLocalStorage();
    const poorUserEmail = generateEmail("poor");
    const poorUserLogin = generateLogin("poor");

    cy.request("POST", "http://localhost:8000/api/auth/register", {
      name: "Бедняк",
      surname: "Тест",
      email: poorUserEmail,
      login: poorUserLogin,
      password: "password123",
      password_confirmation: "password123",
    }).then((response) => {
      window.localStorage.setItem("itsw_token", response.body.token);
      window.localStorage.setItem(
        "itsw_auth",
        JSON.stringify({
          state: { user: response.body.user, token: response.body.token },
          version: 0,
        }),
      );
    });

    cy.intercept("POST", "**/api/wallet/purchase").as("purchaseRequest");

    cy.visit("/shop");
    cy.get('[data-cy^="buy-btn-"]').first().click();
    cy.get(SELECTORS.shop.confirmPurchase).click();

    cy.wait("@purchaseRequest").its("response.statusCode").should("eq", 422);
    cy.contains("Недостаточно средств").should("be.visible");
  });
});
