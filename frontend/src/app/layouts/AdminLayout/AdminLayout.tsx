import { Footer } from "@/widgets/Footer";
import { Header } from "@/widgets/Header";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Menu } from "antd";
import { allRoutes } from "@/app/router/routes";

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
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginBottom: 20, borderBottom: "1px solid #f0f0f0" }}
        />
      </nav>

      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
