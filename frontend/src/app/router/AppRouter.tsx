import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { allRoutes } from "./routes";
import { ApiAuthListener } from "../providers/ApiAuthListener";

export function AppRouter() {
  return (
    <Router>
      <ApiAuthListener/>
      <>
        <Routes>
          {allRoutes.map((route) => (
            <Route key={route.path} element={<route.element />} path={route.path} />
          ))}
        </Routes>
      </>
    </Router>
  );
}
