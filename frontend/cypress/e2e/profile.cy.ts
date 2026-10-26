describe("User Profile Management", () => {
  beforeEach(() => {
    // Логинимся под обычным юзером перед каждым тестом
    cy.loginAsUser();
    cy.visit("/profile");
  });

  it("Пользователь может успешно отредактировать свой профиль", () => {
    // 1. Открываем форму редактирования
    cy.get('[data-cy="edit-profile-btn"]').click();

    // 2. Меняем данные в полях
    cy.get('[data-cy="edit-name"]').clear().type("НовоеИмя");
    cy.get('[data-cy="edit-surname"]').clear().type("НоваяФамилия");

    // Перехватываем запрос на обновление
    cy.intercept("PATCH", "**/api/users/*").as("updateProfile");

    // 3. Нажимаем "Сохранить" в шапке
    cy.get('[data-cy="save-profile-btn"]').click();

    // 4. Ждем ответа сервера и проверяем UI
    cy.wait("@updateProfile").its("response.statusCode").should("eq", 200);

    // Должно появиться зеленое уведомление
    cy.contains("Профиль успешно обновлен").should("be.visible");

    // Форма закрылась, а в View-режиме отображается новое имя
    cy.get('[data-cy="edit-name"]').should("not.exist");
    cy.contains("НовоеИмя").should("be.visible");
  });

  it("Пользователь может отменить редактирование профиля", () => {
    // 1. Открываем форму
    cy.get('[data-cy="edit-profile-btn"]').click();

    // 2. Вводим данные, которые не должны сохраниться
    cy.get('[data-cy="edit-name"]').clear().type("ТекстКоторыйСотрется");

    // 3. Нажимаем крестик (Отмена)
    cy.get('[data-cy="cancel-profile-btn"]').click();

    // 4. Проверяем, что форма закрылась и текст не сохранился
    cy.get('[data-cy="edit-name"]').should("not.exist");
    cy.contains("ТекстКоторыйСотрется").should("not.exist");
  });
  it("Защита от XSS-инъекций при редактировании профиля", () => {
    const xssPayload = '<script>alert("hacked")</script>';

    // Перехватываем alert ДО загрузки страницы
    cy.visit("/profile", {
      onBeforeLoad(win) {
        cy.stub(win, "alert").as("alertStub");
      },
    });

    cy.get('[data-cy="edit-profile-btn"]').click();

    // Вводим XSS в поле Имя
    cy.get('[data-cy="edit-name"]')
      .clear()
      .type(xssPayload, { parseSpecialCharSequences: false });

    // Перехватываем запрос на обновление
    cy.intercept("PATCH", "**/api/users/*").as("updateProfile");

    cy.get('[data-cy="save-profile-btn"]').click();

    // Ждем ответа сервера
    cy.wait("@updateProfile").its("response.statusCode").should("eq", 200);

    // 1. Проверяем, что скрипт не выполнился
    cy.get("@alertStub").should("not.have.been.called");

    // 2. Проверяем, что React вывел его как обычный текст на странице
    cy.get('[data-cy="edit-name"]').should("not.exist");
    cy.contains(xssPayload).should("be.visible");
  });

  it("Защита от SQL-инъекций при редактировании профиля (UI)", () => {
    const sqliPayload = "' OR 1=1 --";

    cy.visit("/profile");
    cy.get('[data-cy="edit-profile-btn"]').click();

    // Вводим SQLi в поле Имя
    cy.get('[data-cy="edit-name"]')
      .clear()
      .type(sqliPayload, { parseSpecialCharSequences: false });

    cy.intercept("PATCH", "**/api/users/*").as("updateProfile");

    cy.get('[data-cy="save-profile-btn"]').click();

    // Если на бэкенде валидация не запрещает спецсимволы в имени,
    // запрос пройдет успешно (200), так как Eloquent безопасно сохраняет это как строку.
    cy.wait("@updateProfile").its("response.statusCode").should("eq", 200);

    // Проверяем, что интерфейс не сломался и отображает новое "имя"
    cy.contains(sqliPayload).should("be.visible");
  });
  it("Пользователь может пополнить баланс", () => {
    cy.loginAsUser();
    cy.visit("/profile");

    // Запоминаем текущий баланс (скорее всего 0.00)
    cy.get('[data-cy="wallet-balance"] .ant-statistic-content-value')
      .invoke("text")
      .then((initialBalance) => {
        // Открываем модалку
        cy.get('[data-cy="open-deposit-btn"]').click();

        // Вводим сумму и подтверждаем
        cy.get('[data-cy="deposit-amount-input"]').clear().type("500");

        cy.intercept("POST", "**/api/wallet/deposit").as("depositRequest");
        cy.get('[data-cy="deposit-submit-btn"]').click();

        // Ждем ответа сервера
        cy.wait("@depositRequest").its("response.statusCode").should("eq", 200);

        // Проверяем уведомление
        cy.contains("Баланс успешно пополнен").should("be.visible");

        // Проверяем, что баланс на карточке обновился (стал больше начального)
        cy.get('[data-cy="wallet-balance"] .ant-statistic-content-value', {
          timeout: 10000,
        }).should(($newBalance) => {
          const newBalanceText = $newBalance
            .text()
            .replace(/\s/g, "")
            .replace(",", "");
          const initialText = initialBalance
            .replace(/\s/g, "")
            .replace(",", "");
          expect(Number(newBalanceText)).to.be.greaterThan(Number(initialText));
        });
      });
  });
});
