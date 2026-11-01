import { Footer } from "@/widgets/Footer";
import { Header } from "@/widgets/Header";
import { Outlet } from "react-router";
import s from "./UserLayout.module.scss";

export function UserLayout() {
  return (
    <>
      <Header />
      <main className={s.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
