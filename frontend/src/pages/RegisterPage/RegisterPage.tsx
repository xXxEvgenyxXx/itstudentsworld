import { Navigate } from "react-router-dom";
import { useAuth } from "@/entities/user";
import { RegisterForm } from "@/features/store/auth/ui";
import { Card } from "antd";
import s from './RegisterPage.module.scss'

export const RegisterPage = () => {
  const { isAuthenticated } = useAuth();

  // Если уже авторизован - принудительно на профиль
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div
      className={s.pageWrapper}
    >
      <Card className={s.formCard} title="Регистрация">
        <RegisterForm />
      </Card>
    </div>
  );
};
