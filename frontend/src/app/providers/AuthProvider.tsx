import { ReactNode, useEffect } from 'react';
import { Spin } from 'antd';
import { useMe, useAuthStore } from '@/entities/user';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isLoading } = useMe();

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  if (token && isLoading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}