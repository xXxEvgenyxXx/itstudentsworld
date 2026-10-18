import { useAuthStore } from "../store";
import { useIsAdmin, useIsAuthenticated, useIsOwner } from "../store/selectors";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const isOwner = useIsOwner();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isOwner,
    setAuth,
    setUser,
    clearAuth,
  };
}
