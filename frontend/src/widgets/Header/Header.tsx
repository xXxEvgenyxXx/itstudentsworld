import { Link, useNavigate } from "react-router-dom";
import { useAuth, useLogout } from "@/entities/user";
import { Button, Space, Typography } from "antd";

const { Text } = Typography;

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

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
      <Link to="/" style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
        IT Students World
      </Link>

      <Space size="large">
        {isAuthenticated ? (
          <>
            <Text data-cy="header-username" style={{ color: "white" }}>
              Привет, {user?.login}!
            </Text>
            <Button data-cy="header-logout" onClick={() => logout()}>
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Button
              type="text"
              style={{ color: "white" }}
              onClick={() => navigate("/login")}
            >
              Войти
            </Button>
            <Button type="primary" onClick={() => navigate("/register")}>
              Регистрация
            </Button>
          </>
        )}
      </Space>
    </header>
  );
}
