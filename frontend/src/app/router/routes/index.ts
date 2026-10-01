import { publicRoutes } from "./publicRoutes";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";

export const allRoutes =[
    ...publicRoutes,
    ...userRoutes,
    ...adminRoutes
]