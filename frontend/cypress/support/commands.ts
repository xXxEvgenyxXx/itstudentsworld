/// <reference types="cypress" />
/* eslint-disable @typescript-eslint/no-namespace */
import type { User } from "@/entities/user";

const setAuthData = (user: User, token: string) => {
  window.localStorage.setItem("itsw_token", token);
  window.localStorage.setItem(
    "itsw_auth",
    JSON.stringify({
      state: { user, token },
      version: 0,
    }),
  );
};

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsOwner(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsUser(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("loginAsOwner", () => {
  cy.env(["OWNER_PASSWORD"]).then((env) => {
    const password = (env.OWNER_PASSWORD as string) || "owner12345";

    cy.request({
      method: "POST",
      url: "http://localhost:8000/api/auth/login",
      body: { email: "itswowner@example.com", password: password },
    }).then((response) => {
      setAuthData(response.body.user, response.body.token);
      cy.wrap(response.body.token).as("ownerToken"); // <-- Сохраняем токен владельца
    });
  });
});

Cypress.Commands.add("loginAsAdmin", () => {
  cy.env(["OWNER_PASSWORD"]).then((env) => {
    const password = (env.OWNER_PASSWORD as string) || "owner12345";

    cy.request({
      method: "POST",
      url: "http://localhost:8000/api/auth/login",
      body: { email: "itswowner@example.com", password: password },
    }).then((ownerResponse) => {
      const ownerToken = ownerResponse.body.token;
      const email = `admin_${Date.now()}@example.com`;

      cy.request({
        method: "POST",
        url: "http://localhost:8000/api/auth/register",
        body: {
          name: "Админ",
          surname: "Тестов",
          email: email,
          login: `admin_${Date.now()}`,
          password: "password123",
          password_confirmation: "password123",
        },
      }).then((userResponse) => {
        const newUserId = userResponse.body.user.id;

        cy.request({
          method: "PATCH",
          url: `http://localhost:8000/api/admin/users/${newUserId}/role`,
          headers: { Authorization: `Bearer ${ownerToken}` },
          body: { role_alias: "admin" },
        }).then(() => {
          const updatedUser = {
            ...userResponse.body.user,
            role: { ...userResponse.body.user.role, alias: "admin" },
          };
          setAuthData(updatedUser, userResponse.body.token);
          cy.wrap(userResponse.body.token).as("adminToken"); // <-- Сохраняем токен админа
        });
      });
    });
  });
});

Cypress.Commands.add("loginAsUser", () => {
  const uniqueId = Date.now();
  const email = `user_${uniqueId}@test.com`;
  const login = `user_${uniqueId}`;

  cy.request({
    method: "POST",
    url: "http://localhost:8000/api/auth/register",
    body: {
      name: "Юзер",
      surname: "Тестов",
      email: email,
      login: login,
      password: "password123",
      password_confirmation: "password123",
    },
  }).then((response) => {
    setAuthData(response.body.user, response.body.token);
    cy.wrap(response.body.token).as("userToken");
  });
});

export {};
