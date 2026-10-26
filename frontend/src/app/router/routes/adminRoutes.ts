import { AdminCosmeticsPage } from "@/pages/AdminCosmeticsPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminTransactionsPage } from "@/pages/AdminTransactionsPage";
import { AdminUsersPage } from "@/pages/AdminUsersPage";

export const adminRoutes = {
  ADMIN_DASHBOARD_PAGE: {
    path: "/admin/dashboard",
    element: AdminDashboardPage,
    access: "admin",
  },
  ADMIN_USERS_PAGE: {
    path: "/admin/users",
    element: AdminUsersPage,
    access: "admin",
  },
  ADMIN_TRANSACTIONS_PAGE: {
    path: "/admin/transactions",
    element: AdminTransactionsPage,
    access: "admin",
  },
  ADMIN_COSMETICS_PAGE: {
    path: "/admin/cosmetics",
    element: AdminCosmeticsPage,
    access: "admin",
  },
};
