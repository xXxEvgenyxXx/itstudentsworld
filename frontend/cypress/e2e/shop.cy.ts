import { SELECTORS } from "../support/selectors";

describe("Shop & Wishlist Flow", () => {
  beforeEach(() => {
    const currentId = Date.now();
    const email = `shop_${currentId}@example.com`;
    const login = `shop_${currentId}`;
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

  it("Успешная покупка предмета и смена статуса кнопки", () => {
    cy.visit("/shop");
    cy.intercept("POST", "**/api/wallet/purchase").as("purchaseRequest");

    cy.get('[data-cy^="buy-btn-"]').first().as("buyButton");
    cy.get("@buyButton").click();

    cy.get(SELECTORS.shop.confirmPurchase).click();
    cy.wait("@purchaseRequest").its("response.statusCode").should("eq", 201);

    cy.get("@buyButton").should("contain", "Уже куплено").and("be.disabled");
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
    const poorUserEmail = `poor_${Date.now()}@example.com`;

    cy.request("POST", "http://localhost:8000/api/auth/register", {
      name: "Бедняк",
      surname: "Тест",
      email: poorUserEmail,
      login: `poor_${Date.now()}`,
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
