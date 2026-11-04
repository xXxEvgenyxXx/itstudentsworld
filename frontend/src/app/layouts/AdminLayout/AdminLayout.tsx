import { Footer } from "@/widgets/Footer";
import { Header } from "@/widgets/Header";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Menu } from "antd";
import { allRoutes } from "@/app/router/routes";
import s from "./AdminLayout.module.scss";

// Маппинг путей в человекочитаемые названия для меню
const routeLabels: Record<string, string> = {
  "/admin/dashboard": "Панель мониторинга",
  "/admin/users": "Пользователи",
  "/admin/transactions": "Транзакции",
  "/admin/cosmetics": "Косметика",
};

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Формируем элементы меню из констант
  const menuItems = Object.values(allRoutes.adminRoutes).map((route) => ({
    key: route.path,
    label: routeLabels[route.path] || route.path,
  }));

  return (
    <>
      <Header />
      <div className={s.adminLayoutContentWrapper}>
        <nav className={s.navWrapper}>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            disabledOverflow={true}
            onClick={({ key }) => navigate(key)}
            style={{ marginBottom: 20 }}
            className={s.menu}
          />
        </nav>

        <main className={s.main}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
}
