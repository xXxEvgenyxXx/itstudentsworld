import type { useAuthStore } from "@/entities/user";

declare global {
  interface Window {
    __authStore?: typeof useAuthStore;
  }
}

export {};
