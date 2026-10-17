import { ReactNode, useEffect } from 'react';
import { Spin } from 'antd';
import { useMe, useAuthStore } from '@/entities/user';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isLoading } = useMe();

  // Синхронизируем свежие данные с бэкенда в наш Zustand-стор
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  // Пока идет проверка токена (F5 на странице), показываем сплэш
  if (token && isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#141414', // Темный фон под стиль Minecraft
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}