export const ADMIN_COSMETICS_DATA_CY = {
  SEARCH: "admin-cosmetics-search",
  ADD_BTN: "add-cosmetic-btn",
  EDIT_BTN: (id: number) => `edit-cosmetic-${id}`,
  DELETE_BTN: (id: number) => `delete-cosmetic-${id}`,
  RESTORE_BTN: (id: number) => `restore-cosmetic-${id}`,
  SAVE_BTN: "save-cosmetic-btn",
  FORM_NAME: "form-name",
  FORM_TYPE: "form-type",
  FORM_PRICE: "form-price",
  FORM_IMAGE: "form-image",
  SEARCH_BTN: "admin-cosmetics-search-btn",
} as const;
