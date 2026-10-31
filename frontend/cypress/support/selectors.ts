import { DATA_CY } from "@/shared/config/dataCy";

// Хелпер для генерации CSS-селектора
const cy = (value: string) => `[data-cy="${value}"]`;

export const SELECTORS = {
  auth: {
    loginEmail: cy(DATA_CY.auth.LOGIN_EMAIL),
    loginPassword: cy(DATA_CY.auth.LOGIN_PASSWORD),
    loginSubmit: cy(DATA_CY.auth.LOGIN_SUBMIT),
    regName: cy(DATA_CY.auth.REG_NAME),
    regSurname: cy(DATA_CY.auth.REG_SURNAME),
    regEmail: cy(DATA_CY.auth.REG_EMAIL),
    regLogin: cy(DATA_CY.auth.REG_LOGIN),
    regPassword: cy(DATA_CY.auth.REG_PASSWORD),
    regPasswordConfirm: cy(DATA_CY.auth.REG_PASSWORD_CONFIRM),
    regSubmit: cy(DATA_CY.auth.REG_SUBMIT),
    errorAlert: cy(DATA_CY.auth.ERROR_ALERT),
    regNameWrapper: cy(DATA_CY.auth.REG_NAME_WRAPPER),
  },
  header: {
    username: cy(DATA_CY.header.USERNAME),
    logoutBtn: cy(DATA_CY.header.LOGOUT_BTN),
  },
  profile: {
    viewLogin: cy(DATA_CY.profile.VIEW_LOGIN),
    viewEmail: cy(DATA_CY.profile.VIEW_EMAIL),
    editBtn: cy(DATA_CY.profile.EDIT_BTN),
    saveBtn: cy(DATA_CY.profile.SAVE_BTN),
    cancelBtn: cy(DATA_CY.profile.CANCEL_BTN),
    editName: cy(DATA_CY.profile.EDIT_NAME),
    editSurname: cy(DATA_CY.profile.EDIT_SURNAME),
    editEmail: cy(DATA_CY.profile.EDIT_EMAIL),
    tabInfo: cy(DATA_CY.profile.TAB_INFO),
    tabWishlist: cy(DATA_CY.profile.TAB_WISHLIST),
  },
  wishlist: {
    item: cy(DATA_CY.profile.WISHLIST_ITEM),
  },
  wallet: {
    balance: cy(DATA_CY.wallet.BALANCE),
    openDepositBtn: cy(DATA_CY.wallet.OPEN_DEPOSIT_BTN),
    depositAmount: cy(DATA_CY.wallet.DEPOSIT_AMOUNT),
    depositSubmit: cy(DATA_CY.wallet.DEPOSIT_SUBMIT),
  },
  shop: {
    buyBtn: (id: number) => cy(DATA_CY.shop.BUY_BTN(id)),
    wishlistBtn: (id: number) => cy(DATA_CY.shop.WISHLIST_BTN(id)),
    confirmPurchase: cy(DATA_CY.shop.CONFIRM_PURCHASE),
    anyWishlistBtn: `[data-cy^="${DATA_CY.shop.WISHLIST_BTN_PREFIX}-"]`,
    anyWishlistActiveBtn: `[data-cy^="${DATA_CY.shop.WISHLIST_BTN_ACTIVE_PREFIX}-"]`,
    anyBuyBtn: `[data-cy^="${DATA_CY.shop.BUY_BTN_PREFIX}-"]`,
  },
  admin: {
    users: {
      search: cy(DATA_CY.admin.users.SEARCH),
      searchBtn: cy(DATA_CY.admin.users.SEARCH_BTN),
      login: (id: number) => cy(DATA_CY.admin.users.LOGIN(id)),
      email: (id: number) => cy(DATA_CY.admin.users.EMAIL(id)),
      roleSelect: (id: number) => cy(DATA_CY.admin.users.ROLE_SELECT(id)),
      roleTag: (id: number) => cy(DATA_CY.admin.users.ROLE_TAG(id)),
      balance: (id: number) => cy(DATA_CY.admin.users.BALANCE(id)),
      statusTag: (id: number) => cy(DATA_CY.admin.users.STATUS_TAG(id)),
      walletBtn: (id: number) => cy(DATA_CY.admin.users.WALLET_BTN(id)),
      banBtn: (id: number) => cy(DATA_CY.admin.users.BAN_BTN(id)),
    },
    cosmetics: {
      search: cy(DATA_CY.admin.cosmetics.SEARCH),
      searchBtn: cy(DATA_CY.admin.cosmetics.SEARCH_BTN),
      addBtn: cy(DATA_CY.admin.cosmetics.ADD_BTN),
      editBtn: (id: number) => cy(DATA_CY.admin.cosmetics.EDIT_BTN(id)),
      deleteBtn: (id: number) => cy(DATA_CY.admin.cosmetics.DELETE_BTN(id)),
      restoreBtn: (id: number) => cy(DATA_CY.admin.cosmetics.RESTORE_BTN(id)),
      saveBtn: cy(DATA_CY.admin.cosmetics.SAVE_BTN),
      formName: cy(DATA_CY.admin.cosmetics.FORM_NAME),
      formType: cy(DATA_CY.admin.cosmetics.FORM_TYPE),
      formPrice: cy(DATA_CY.admin.cosmetics.FORM_PRICE),
      formImage: cy(DATA_CY.admin.cosmetics.FORM_IMAGE),
    },
    transactions: {
      search: cy(DATA_CY.admin.transactions.SEARCH),
      typeFilter: cy(DATA_CY.admin.transactions.TYPE_FILTER),
      statusFilter: cy(DATA_CY.admin.transactions.STATUS_FILTER),
    },
    dashboard: {
      totalUsers: cy(DATA_CY.admin.dashboard.STAT_TOTAL_USERS),
      failedTx: cy(DATA_CY.admin.dashboard.STAT_FAILED_TX),
      revenue: cy(DATA_CY.admin.dashboard.STAT_REVENUE),
    },
    wallet: {
      typeSelect: cy(DATA_CY.admin.wallet.TYPE_SELECT),
      amountInput: cy(DATA_CY.admin.wallet.AMOUNT_INPUT),
      commentInput: cy(DATA_CY.admin.wallet.COMMENT_INPUT),
      submitBtn: cy(DATA_CY.admin.wallet.SUBMIT_BTN),
    },
  },
};
