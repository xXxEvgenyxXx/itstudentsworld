import { Navigate } from "react-router-dom";
import { useAuth } from "@/entities/user";
import { LoginForm } from "@/features/store/auth/ui";
import { Card } from "antd";
import s from "./LoginPage.module.scss";

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();

  // Если уже авторизован - принудительно на профиль
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className={s.pageWrapper}>
      <Card className={s.formCard} title="Вход в аккаунт">
        <LoginForm />
      </Card>
    </div>
  );
};
