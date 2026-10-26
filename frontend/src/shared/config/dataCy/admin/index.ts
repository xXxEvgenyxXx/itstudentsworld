import { ADMIN_USERS_DATA_CY } from "./users";
import { ADMIN_COSMETICS_DATA_CY } from "./cosmetics";
import { ADMIN_TRANSACTIONS_DATA_CY } from "./transactions";
import { ADMIN_DASHBOARD_DATA_CY } from "./dashboard";
import { ADMIN_WALLET_DATA_CY } from "./wallet";

export const ADMIN_DATA_CY = {
  users: ADMIN_USERS_DATA_CY,
  cosmetics: ADMIN_COSMETICS_DATA_CY,
  transactions: ADMIN_TRANSACTIONS_DATA_CY,
  dashboard: ADMIN_DASHBOARD_DATA_CY,
  wallet: ADMIN_WALLET_DATA_CY,
} as const;

export * from "./users";
export * from "./cosmetics";
export * from "./transactions";
export * from "./dashboard";
export * from "./wallet";
