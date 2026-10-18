import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onUnauthorized } from "@/shared/api";
import { useAuthStore } from "@/entities/user";

export const ApiAuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    return onUnauthorized(() => {
      useAuthStore.getState().clearAuth();
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  return null;
};
