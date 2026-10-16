import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/global.scss";
import { useAuthStore } from '@/entities/user';

if (import.meta.env.DEV) {
  window.__authStore = useAuthStore;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
