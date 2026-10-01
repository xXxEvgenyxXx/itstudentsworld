import { Footer } from "@/widgets/Footer";
import { Header } from "@/widgets/Header";
import { Outlet } from "react-router";

export function AdminLayout(){
    return (
        <>
            <Header />
            <main>
                <Outlet/>
            </main>
            <Footer/>
        </>
    )
}