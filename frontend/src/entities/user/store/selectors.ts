import { useAuthStore } from "./useAuthStore";

export const useIsAuthenticated = () => useAuthStore((s) => s.token !== null);

export const useIsAdmin = () =>
  useAuthStore((s) => {
    const role = s.user?.role.alias;
    return role === "admin" || role === "owner";
  });

export const useIsOwner = () =>
  useAuthStore((s) => s.user?.role.alias === "owner");
