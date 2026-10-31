export const SHOP_DATA_CY = {
  BUY_BTN: (id: number) => `buy-btn-${id}`,
  WISHLIST_BTN: (id: number) => `wishlist-btn-${id}` as const,
  WISHLIST_BTN_ACTIVE: (id: number) => `wishlist-btn-active-${id}` as const,
  CONFIRM_PURCHASE: "confirm-purchase-btn",
  WISHLIST_BTN_PREFIX: "wishlist-btn",
  WISHLIST_BTN_ACTIVE_PREFIX: "wishlist-btn-active",
  BUY_BTN_PREFIX: "buy-btn",
} as const;
