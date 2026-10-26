import { SELECTORS } from "../support/selectors";

describe("Admin Cosmetics Management", () => {
  let testItemId: number;
  let testItemName: string;

  beforeEach(() => {
    cy.loginAsAdmin();

    testItemName = `Предмет E2E ${Date.now()}`;

    cy.get("@adminToken").then((token) => {
      cy.request({
        method: "POST",
        url: "http://localhost:8000/api/admin/cosmetic-items",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          name: testItemName,
          type_id: 1,
          price: 100,
          image_url: "/test.png",
        },
      }).then((response) => {
        testItemId = response.body.item.id;
      });
    });

    cy.intercept("GET", "**/api/admin/cosmetic-items?*").as("getCosmetics");
    cy.visit("/admin/cosmetics");
    cy.wait("@getCosmetics");
  });

  it("Админ может создать новый предмет", () => {
    cy.intercept("POST", "**/api/admin/cosmetic-items").as("createCosmetic");
    const newItemName = `Супер Шляпа ${Date.now()}`;

    cy.get(SELECTORS.admin.cosmetics.addBtn).click();
    cy.get(SELECTORS.admin.cosmetics.formName).type(newItemName);
    cy.get(SELECTORS.admin.cosmetics.formType).click({ force: true });
    cy.contains(".ant-select-item-option", "Головной убор").click({
      force: true,
    });
    cy.get(SELECTORS.admin.cosmetics.formPrice).type("250.50");
    cy.get(SELECTORS.admin.cosmetics.formImage).type("/images/hat.png");
    cy.get(SELECTORS.admin.cosmetics.saveBtn).click();

    cy.wait("@createCosmetic").its("response.statusCode").should("eq", 201);
    cy.wait("@getCosmetics");

    cy.contains(".ant-table-tbody tr", newItemName, { timeout: 10000 }).should(
      "exist",
    );
  });

  it("Админ может изменить цену предмета", () => {
    cy.intercept("PATCH", "**/api/admin/cosmetic-items/*").as("updateCosmetic");

    cy.get(SELECTORS.admin.cosmetics.editBtn(testItemId)).click();
    cy.get(SELECTORS.admin.cosmetics.formPrice).clear().type("999");
    cy.get(SELECTORS.admin.cosmetics.saveBtn).click();

    cy.wait("@updateCosmetic").its("response.statusCode").should("eq", 200);
    cy.wait("@getCosmetics");

    cy.contains(".ant-table-tbody tr", testItemName).should(
      "contain",
      "999.00",
    );
  });

  it("Админ может удалить предмет", () => {
    cy.intercept("DELETE", "**/api/admin/cosmetic-items/*").as(
      "deleteCosmetic",
    );

    cy.get(SELECTORS.admin.cosmetics.deleteBtn(testItemId)).click();
    cy.get(".ant-popconfirm-buttons button.ant-btn-primary").click();

    cy.wait("@deleteCosmetic").its("response.statusCode").should("eq", 200);
    cy.get(".ant-message-success").should("contain", "Предмет удален");
    cy.wait("@getCosmetics");

    cy.contains(".ant-table-tbody tr", testItemName).should("not.exist");
  });
});
