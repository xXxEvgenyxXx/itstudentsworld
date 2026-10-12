import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onUnauthorized } from "@/shared/api";
// useAuthStore — импорт из entities/user (App-слой может импортировать снизу)

export const ApiAuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    return onUnauthorized(() => {
      // Чистим стор и редиректим
      // useAuthStore.getState().clearAuth();
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  return null;
};
