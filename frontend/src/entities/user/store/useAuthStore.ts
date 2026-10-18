import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { AUTH_TOKEN_KEY } from "@/shared/api";
import type { User } from "../model";

interface AuthState {
  user: User | null;
  token: string | null;

  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,

        setAuth: (user, token) => {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          set({ user, token }, false, "setAuth");
        },

        setUser: (user) => set({ user }, false, "setUser"),

        clearAuth: () => {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          set({ user: null, token: null }, false, "clearAuth");
        },
      }),
      {
        name: "itsw_auth",
        partialize: (state) => ({ user: state.user, token: state.token }),
        onRehydrateStorage: () => (state) => {
          if (state?.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, state.token);
          }
        },
      },
    ),
    {
      name: "AuthStore",
      enabled: import.meta.env.DEV,
    },
  ),
);
