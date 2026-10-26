import { AUTH_DATA_CY } from './auth';
import { HEADER_DATA_CY } from './header';
import { PROFILE_DATA_CY } from './profile';
import { WALLET_DATA_CY } from './wallet';
import { SHOP_DATA_CY } from './shop';
import { ADMIN_DATA_CY } from './admin';

// Единая константа для всего проекта
export const DATA_CY = {
  auth: AUTH_DATA_CY,
  header: HEADER_DATA_CY,
  profile: PROFILE_DATA_CY,
  wallet: WALLET_DATA_CY,
  shop: SHOP_DATA_CY,
  admin: ADMIN_DATA_CY,
} as const;

// Реэкспорт для удобства, если понадобится
export * from './auth';
export * from './header';
export * from './profile';
export * from './wallet';
export * from './shop';
export * from './admin';