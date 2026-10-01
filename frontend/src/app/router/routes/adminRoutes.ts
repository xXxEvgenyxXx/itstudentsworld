import { AdminCosmeticsPage } from "@/pages/AdminCosmeticsPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminTransactionsPage } from "@/pages/AdminTransactionsPage";
import { AdminUsersPage } from "@/pages/AdminUsersPage";

export const adminRoutes = [
    {
        path:"/admin/cosmetics",
        element:AdminCosmeticsPage,
        access:"admin"
    },
    {
        path:"/admin/dashboard",
        element:AdminDashboardPage,
        access:"admin"
    },
    {
        path:"/admin/transactions",
        element:AdminTransactionsPage,
        access:"admin"
    },
    {
        path:"/admin/users",
        element:AdminUsersPage,
        access:"admin"
    }
]