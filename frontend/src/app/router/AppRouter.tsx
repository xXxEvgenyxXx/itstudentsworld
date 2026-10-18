import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { allRoutes } from "./routes";
import { ApiAuthListener } from "../providers/ApiAuthListener";
import { PublicLayout } from "../layouts"; // Импортируй свой лейаут

export function AppRouter() {
  return (
    <Router>
      <ApiAuthListener />
      <Routes>
        {/* Оборачиваем временно ВСЕ маршруты в PublicLayout */}
        <Route element={<PublicLayout />}>
          {allRoutes.map((route) => (
            <Route key={route.path} element={<route.element />} path={route.path} />
          ))}
        </Route>
      </Routes>
    </Router>
  );
}