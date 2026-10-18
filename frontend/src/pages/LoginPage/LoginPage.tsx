import { Navigate } from 'react-router-dom';
import { useAuth } from '@/entities/user';
import { LoginForm } from '@/features/store/auth/ui';
import { Card } from 'antd';

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();

  // Если уже авторизован - принудительно на профиль
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
      <Card title="Вход в аккаунт" style={{ width: 400 }}>
        <LoginForm />
      </Card>
    </div>
  );
};