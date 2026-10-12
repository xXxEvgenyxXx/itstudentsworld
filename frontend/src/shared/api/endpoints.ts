export const API = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  users: {
    list: "/users",
    me: "/users/me",
    detail: (id: number) => `/users/${id}`,
    update: (id: number) => `/users/${id}`,
    password: (id: number) => `/users/${id}/password`,
    role: (id: number) => `/users/${id}/role`,
    ban: (id: number) => `/users/${id}/ban`,
    wallet: (id: number) => `/users/${id}/wallet`,
    cosmetics: (id: number) => `/users/${id}/cosmetics`,
    transactions: (id: number) => `/users/${id}/transactions`,
  },
  wallet: {
    deposit: "/wallet/deposit",
    purchase: "/wallet/purchase",
  },
  cosmetics: {
    list: "/cosmetic-items",
    detail: (id: number) => `/cosmetic-items/${id}`,
    buy: (id: number) => `/cosmetic-items/${id}/buy`,
    types: "/cosmetic-types",
  },
  transactions: {
    list: "/transactions",
    detail: (id: number) => `/transactions/${id}`,
  },
  references: {
    roles: "/roles",
    transactionTypes: "/transaction-types",
    transactionStatuses: "/transaction-statuses",
  },
  health: "/health",
} as const;
