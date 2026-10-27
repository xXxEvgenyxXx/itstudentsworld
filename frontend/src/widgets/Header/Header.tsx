import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth, useLogout } from "@/entities/user";
import { Button, Space } from "antd";
import { DATA_CY } from "@/shared/config";
import { allRoutes } from "@/app/router/routes";

//const { Text } = Typography;

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role.alias === "admin" || user?.role.alias === "owner";
  const { mutate: logout } = useLogout();
  //const navigate = useNavigate();

  const location = useLocation();

  // Стили для NavLink (чтобы не писать инлайн-функции в каждом теге)
  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? "#4096ff" : "white", // Синий при наведении/активности
    fontSize: 16,
    textDecoration: "none",
    transition: "color 0.3s",
  });

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        background: "#001529",
        color: "white",
      }}
    >
      {/* ЛЕВАЯ ЧАСТЬ: Логотип */}
      <Link
        to={allRoutes.publicRoutes.MAIN_PAGE.path}
        style={{
          color: "white",
          fontSize: 20,
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        IT Students World
      </Link>

      {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Публичные ссылки */}
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <NavLink
          to={allRoutes.publicRoutes.SHOP_PAGE.path}
          style={navLinkStyle}
        >
          Магазин
        </NavLink>
        <NavLink
          to={allRoutes.publicRoutes.ABOUT_PAGE.path}
          style={navLinkStyle}
        >
          О сервере
        </NavLink>
        {isAdmin && (
          <NavLink
            to={allRoutes.adminRoutes.ADMIN_DASHBOARD_PAGE.path}
            style={({ isActive }) =>
              navLinkStyle({
                isActive: isActive || location.pathname.startsWith("/admin"),
              })
            }
          >
            Управление
          </NavLink>
        )}
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Авторизация / Профиль */}
      <Space size="large">
        {isAuthenticated ? (
          <>
            <NavLink
              to={allRoutes.userRoutes.PROFILE_PAGE.path}
              data-cy={DATA_CY.header.USERNAME}
              style={({ isActive }) => ({
                color: isActive ? "#4096ff" : "white",
                textDecoration: "none",
                fontSize: 16,
              })}
            >
              {user?.login}
            </NavLink>
            <Button
              data-cy={DATA_CY.header.LOGOUT_BTN}
              onClick={() => logout()}
            >
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Link to={allRoutes.publicRoutes.LOGIN_PAGE.path}>
              <Button type="text" style={{ color: "white" }}>
                Войти
              </Button>
            </Link>
            <Link to={allRoutes.publicRoutes.REGISTER_PAGE.path}>
              <Button type="primary">Регистрация</Button>
            </Link>
          </>
        )}
      </Space>
    </header>
  );
}
