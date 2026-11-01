import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth, useLogout } from "@/entities/user";
import { Button, Space } from "antd";
import { DATA_CY } from "@/shared/config";
import { allRoutes } from "@/app/router/routes";
import s from "./Header.module.scss";
import { clsx } from "clsx";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role.alias === "admin" || user?.role.alias === "owner";
  const { mutate: logout } = useLogout();
  const location = useLocation();

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    clsx(s.headerLink, { [s.active]: isActive });
  const getAdminNavClass = ({ isActive }: { isActive: boolean }) =>
    clsx(s.headerLink, {
      [s.active]: isActive || location.pathname.startsWith("/admin"),
    });

  return (
    <header className={s.header}>
      <Link
        to={allRoutes.publicRoutes.MAIN_PAGE.path}
        className={s.logoWrapper}
      >
        <img className={s.logo} src="/favicon.svg" alt="Logo" />
      </Link>

      <nav className={s.nav}>
        <NavLink
          end
          to={allRoutes.publicRoutes.MAIN_PAGE.path}
          className={getNavClass}
        >
          Главная
        </NavLink>
        <NavLink
          end
          to={allRoutes.publicRoutes.ABOUT_PAGE.path}
          className={getNavClass}
        >
          О сервере
        </NavLink>
        <NavLink
          end
          to={allRoutes.publicRoutes.SHOP_PAGE.path}
          className={getNavClass}
        >
          Магазин
        </NavLink>

        {isAdmin && (
          <NavLink
            to={allRoutes.adminRoutes.ADMIN_DASHBOARD_PAGE.path}
            className={getAdminNavClass}
          >
            Управление
          </NavLink>
        )}
      </nav>

      <Space size="large" className={s.nav}>
        {isAuthenticated ? (
          <>
            <NavLink
              to={allRoutes.userRoutes.PROFILE_PAGE.path}
              data-cy={DATA_CY.header.USERNAME}
              className={getNavClass}
              end
            >
              {user?.login}
            </NavLink>
            <Button
              className={s.navButton}
              data-cy={DATA_CY.header.LOGOUT_BTN}
              onClick={() => logout()}
            >
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Link to={allRoutes.publicRoutes.LOGIN_PAGE.path}>
              <Button
                className={s.navButton}
                type="text"
                style={{ color: "var(--text-main)" }}
              >
                Войти
              </Button>
            </Link>
            <Link to={allRoutes.publicRoutes.REGISTER_PAGE.path}>
              <Button className={s.navButton} type="primary">
                Регистрация
              </Button>
            </Link>
          </>
        )}
      </Space>
    </header>
  );
}
