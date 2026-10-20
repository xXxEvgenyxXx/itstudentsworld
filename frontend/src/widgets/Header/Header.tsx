import { Link, NavLink } from "react-router-dom";
import { useAuth, useLogout } from "@/entities/user";
import { Button, Space } from "antd";

//const { Text } = Typography;

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { mutate: logout } = useLogout();
  //const navigate = useNavigate();

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
        to="/"
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
        <NavLink to="/shop" style={navLinkStyle}>
          Магазин
        </NavLink>
        <NavLink to="/about" style={navLinkStyle}>
          О сервере
        </NavLink>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Авторизация / Профиль */}
      <Space size="large">
        {isAuthenticated ? (
          <>
            <NavLink
              to="/profile"
              data-cy="header-username"
              style={({ isActive }) => ({
                color: isActive ? "#4096ff" : "white",
                textDecoration: "none",
                fontSize: 16,
              })}
            >
              {user?.login}
            </NavLink>
            <Button data-cy="header-logout" onClick={() => logout()}>
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button type="text" style={{ color: "white" }}>
                Войти
              </Button>
            </Link>
            <Link to="/register">
              <Button type="primary">Регистрация</Button>
            </Link>
          </>
        )}
      </Space>
    </header>
  );
}
