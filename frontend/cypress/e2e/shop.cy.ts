describe('Shop & Wishlist Flow', () => {

  beforeEach(() => {
    // Генерируем уникальный ID для КАЖДОГО теста
    const currentId = Date.now();
    const email = `shop_${currentId}@example.com`;
    const login = `shop_${currentId}`;
    const password = 'password123';

    // 1. Создаем юзера через API
    cy.request('POST', 'http://localhost:8000/api/auth/register', {
      name: 'Шоп', 
      surname: 'Тест',
      email: email,
      login: login,
      password: password,
      password_confirmation: password,
    }).then((response) => {
      const token = response.body.token;
      
      // 2. Сразу пополняем ему баланс через API
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/api/wallet/deposit',
        headers: { Authorization: `Bearer ${token}` },
        body: { amount: 5000 }, 
      });

      // 3. Сохраняем токен в LocalStorage
      window.localStorage.setItem('itsw_token', token);
      window.localStorage.setItem('itsw_auth', JSON.stringify({
        state: { user: response.body.user, token },
        version: 0
      }));
    });
  });

  it('Успешная покупка предмета и смена статуса кнопки', () => {
    cy.visit('/shop');
    
    // Перехватываем запрос на покупку
    cy.intercept('POST', '**/api/wallet/purchase').as('purchaseRequest');

    // Берем первый попавшийся предмет и кликаем "Купить"
    cy.get('[data-cy^="buy-btn-"]').first().as('buyButton');
    cy.get('@buyButton').click();

    // В модалке жмем "ОК"
    cy.get('#confirm-purchase-btn').click();

    // Ждем успешный ответ от сервера
    cy.wait('@purchaseRequest').its('response.statusCode').should('eq', 201);

    // Проверяем, что кнопка изменилась на "Уже куплено" и стала неактивной
    cy.get('@buyButton').should('contain', 'Уже куплено').and('be.disabled');
  });

  it('Добавление в избранное и проверка перезагрузки', () => {
    cy.visit('/shop');
    
    cy.intercept('POST', '**/api/wishlist/toggle').as('wishlistRequest');

    // Кликаем на первое сердечко
    cy.get('[data-cy^="wishlist-btn-"]').first().as('heartButton');
    cy.get('@heartButton').click();

    cy.wait('@wishlistRequest').its('response.statusCode').should('eq', 200);

    // Перезагружаем страницу, чтобы проверить, что данные пришли с бэкенда, а не из стейта
    cy.reload();

    // Проверяем, что сердечко закрасилось (ищем иконку с цветом)
    cy.get('[data-cy^="wishlist-btn-"]').first().find('.anticon-heart').should('have.css', 'color', 'rgb(255, 77, 79)');

    // Идем в ЛК и проверяем, что предмет появился в вишлисте
    cy.visit('/profile');
    cy.get('[data-cy="tab-wishlist"]').click();
    cy.get('.ant-list-item').should('have.length.at.least', 1);
  });

  it('Ошибка при попытке покупки без денег', () => {
    cy.clearLocalStorage();
    const poorUserEmail = `poor_${Date.now()}@example.com`;
    
    // Создаем юзера без денег
    cy.request('POST', 'http://localhost:8000/api/auth/register', {
      name: 'Бедняк', surname: 'Тест', email: poorUserEmail, login: `poor_${Date.now()}`,
      password: 'password123', password_confirmation: 'password123',
    }).then((response) => {
      window.localStorage.setItem('itsw_token', response.body.token);
      window.localStorage.setItem('itsw_auth', JSON.stringify({
        state: { user: response.body.user, token: response.body.token },
        version: 0
      }));
    });

    // ПЕРЕХВАТЫВАЕМ ЗАПРОС НА ПОКУПКУ
    cy.intercept('POST', '**/api/wallet/purchase').as('purchaseRequest');

    cy.visit('/shop');
    cy.get('[data-cy^="buy-btn-"]').first().click();
    cy.get('#confirm-purchase-btn').click();

    // ЖДЕМ ОТВЕТ 422 ОТ СЕРВЕРА
    cy.wait('@purchaseRequest').its('response.statusCode').should('eq', 422);

    // ПРОВЕРЯЕМ ТЕКСТ ОШИБКИ (это надежнее любых классов)
    cy.contains('Недостаточно средств').should('be.visible');
  });
});