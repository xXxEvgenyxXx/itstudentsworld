import { useAuth } from '@/entities/user';

export function MainPage() {
  const { user, isAuthenticated, isAdmin, isOwner, setAuth, clearAuth } = useAuth();

  const mockUser = {
    id: 1,
    name: 'Иван',
    surname: 'Иванов',
    patronymic: null,
    email: 'test@example.com',
    login: 'testuser',
    is_banned: false,
    created_at: new Date().toISOString(),
    role: { id: 1, name: 'Пользователь', alias: 'user' as const },
    wallet: { user_id: 1, balance: '100.00' },
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Auth Store Sandbox</h1>
      <p>isAuthenticated: {String(isAuthenticated)}</p>
      <p>isAdmin: {String(isAdmin)}</p>
      <p>isOwner: {String(isOwner)}</p>
      <p>user: {user?.login ?? 'null'}</p>

      <button onClick={() => setAuth(mockUser, 'token-123')}>Set Auth</button>
      <button onClick={clearAuth}>Clear Auth</button>
    </div>
  );
}
