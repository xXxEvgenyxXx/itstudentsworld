import { ProfilePage } from "@/pages/ProfilePage";

export const userRoutes = [
    {
        path:"/profile",
        element:ProfilePage,
        access:"user"
    }
]