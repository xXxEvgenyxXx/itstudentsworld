export type {
  CosmeticItem,
  CosmeticType,
  PaginatedResponse,
} from "./model/types";
export { cosmeticApi} from "./api/cosmeticApi";
export { useCosmeticTypes, useCreateCosmetic, useUpdateCosmetic, useDeleteCosmetic, useAdminCosmetics, useRestoreCosmetic } from "./lib/useAdminCosmetics";
export {adminCosmeticApi} from "./api/adminCosmeticApi"
export { useCosmetics } from "./lib/useCosmetics";
