describe('Admin Users Management', () => {
  let targetUserLogin: string;
  let targetUserId: number;

  beforeEach(() => {
    cy.loginAsOwner();
    const uniqueId = Date.now();
    targetUserLogin = `target_user_${uniqueId}`;

    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/api/auth/register',
      body: {
        name: 'Target', surname: 'User', email: `target_${uniqueId}@test.com`, login: targetUserLogin,
        password: 'password123', password_confirmation: 'password123'
      }
    }).then((response) => {
      targetUserId = response.body.user.id;
    });

    cy.intercept('GET', '**/api/admin/users?*').as('getUsers');
    cy.visit('/admin/users');
    cy.wait('@getUsers');
  });

  it('Админ не может забанить владельца (кнопка disabled)', () => {
    cy.loginAsAdmin(); 
    cy.visit('/admin/users');
    cy.wait('@getUsers');

    cy.intercept('GET', '**/api/admin/users?*search=itsw_owner*').as('searchOwner');
    
    cy.get('[data-cy="admin-users-search"]').type('itsw_owner');
    cy.get('[data-cy="admin-users-search-btn"]').click();
    cy.wait('@searchOwner'); 

    cy.get('[data-cy^="ban-btn-"]').should('be.disabled');
  });

    it('Владелец может менять роли', () => {
        cy.intercept('GET', `**/api/admin/users?*search=${targetUserLogin}*`).as('searchTarget');
        cy.intercept('PATCH', `**/api/admin/users/${targetUserId}/role`).as('changeRole');

        cy.get('[data-cy="admin-users-search"]').type(targetUserLogin);
        cy.get('[data-cy="admin-users-search-btn"]').click();
        cy.wait('@searchTarget');

        cy.get(`[data-cy="role-select-${targetUserId}"]`).click({ force: true });
        cy.contains('.ant-select-item-option', 'Администратор').click({ force: true });

        cy.wait('@changeRole').its('response.statusCode').should('eq', 200);
        
        cy.wait('@getUsers');

        cy.get(`[data-cy="role-select-${targetUserId}"]`, { timeout: 10000 }).should('contain', 'Администратор');
    });

    it('Админ может забанить обычного юзера', () => {
        cy.loginAsAdmin();
        cy.visit('/admin/users');
        cy.wait('@getUsers');

        cy.intercept('GET', `**/api/admin/users?*search=${targetUserLogin}*`).as('searchTarget');
        cy.intercept('PATCH', `**/api/admin/users/${targetUserId}/ban`).as('banUser');

        cy.get('[data-cy="admin-users-search"]').type(targetUserLogin);
        cy.get('[data-cy="admin-users-search-btn"]').click();
        cy.wait('@searchTarget');

        cy.get(`[data-cy="ban-btn-${targetUserId}"]`).click();
        cy.get('.ant-popconfirm-buttons button.ant-btn-primary').click();
        
        cy.wait('@banUser').its('response.statusCode').should('eq', 200);
        
        cy.wait('@getUsers'); 
        
        cy.get(`[data-cy="status-tag-${targetUserId}"]`, { timeout: 10000 }).should('contain', 'Забанен');
    });
});