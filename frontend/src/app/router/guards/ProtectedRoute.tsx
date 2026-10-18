import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/entities/user';
import { Result, Button } from 'antd';

interface ProtectedRouteProps {
  allowedRoles?: Array<'user' | 'admin' | 'owner'>;
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Если не авторизован — на страницу логина, запомнив, откуда пришел
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Если пользователь забанен — не пускаем в ЛК/Админку
  // (Если у тебя есть отдельная страница для забаненных, редиректни туда)
  if (user?.is_banned) {
    return (
      <Result
        status="403"
        title="Аккаунт заблокирован"
        subTitle="Вы не можете получить доступ к этой странице, так как ваш аккаунт заблокирован."
      />
    );
  }

  // 3. Если роли переданы, проверяем, подходит ли текущая роль
  if (allowedRoles && !allowedRoles.includes(user!.role.alias)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="У вас нет прав для доступа к этой странице."
        extra={<Button type="primary" href="/">На главную</Button>}
      />
    );
  }

  // 4. Если всё ок — рендерим дочерние маршруты (или страницу)
  return <Outlet />;
};