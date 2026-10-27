import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { allRoutes } from "./routes";
import { ApiAuthListener } from "../providers/ApiAuthListener";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { PublicLayout, UserLayout, AdminLayout } from "@/app/layouts";

export function AppRouter() {
  return (
    <Router>
      <ApiAuthListener />
      <Routes>
        {/* Доступные всем маршруты */}
        <Route element={<PublicLayout />}>
          {Object.values(allRoutes.publicRoutes).map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.element />}
            />
          ))}
        </Route>

        {/* Маршруты для авторизованных пользователей */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            {Object.values(allRoutes.userRoutes).map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element />}
              />
            ))}
          </Route>
        </Route>

        {/* Маршруты для администратора и владельца */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
          <Route element={<AdminLayout />}>
            {Object.values(allRoutes.adminRoutes).map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element />}
              />
            ))}
          </Route>
        </Route>

        {/* Страница 404 */}
        <Route
          path="*"
          element={
            <div style={{ padding: 50, textAlign: "center" }}>
              <h1>404 - Страница не найдена</h1>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
