export const ADMIN_USERS_DATA_CY = {
  SEARCH: 'admin-users-search',
  LOGIN: (id: number) => `login-${id}`,
  EMAIL: (id: number) => `email-${id}`,
  ROLE_SELECT: (id: number) => `role-select-${id}`,
  ROLE_TAG: (id: number) => `role-tag-${id}`,
  BALANCE: (id: number) => `balance-${id}`,
  STATUS_TAG: (id: number) => `status-tag-${id}`,
  WALLET_BTN: (id: number) => `wallet-btn-${id}`,
  BAN_BTN: (id: number) => `ban-btn-${id}`,
} as const;