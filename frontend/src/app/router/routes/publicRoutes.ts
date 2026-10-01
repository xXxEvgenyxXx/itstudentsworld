import { ShopPage } from "@/pages/ShopPage";
import { MainPage } from "@/pages/MainPage";
import { AboutPage } from "@/pages/AboutPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

export const publicRoutes = [
    {
        path: "/",
        element: MainPage,
        access: "public"
    },
    {
        path: "/shop",
        element: ShopPage,
        access: "public"
    },
    {
        path: "/about",
        element: AboutPage,
        access: "public"
    },
    {
        path: "/login",
        element: LoginPage,
        access: "public"
    },
    {
        path: "/register",
        element: RegisterPage,
        access: "public"
    },
]