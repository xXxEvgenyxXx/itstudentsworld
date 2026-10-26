import { ShopPage } from "@/pages/ShopPage";
import { MainPage } from "@/pages/MainPage";
import { AboutPage } from "@/pages/AboutPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

export const publicRoutes = {
  MAIN_PAGE: {
    path: "/",
    element: MainPage,
    access: "public",
  },
  SHOP_PAGE: {
    path: "/shop",
    element: ShopPage,
    access: "public",
  },
  ABOUT_PAGE: {
    path: "/about",
    element: AboutPage,
    access: "public",
  },
  LOGIN_PAGE: {
    path: "/login",
    element: LoginPage,
    access: "public",
  },
  REGISTER_PAGE: {
    path: "/register",
    element: RegisterPage,
    access: "public",
  },
};
