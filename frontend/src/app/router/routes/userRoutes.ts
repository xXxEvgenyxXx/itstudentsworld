import { ProfilePage } from "@/pages/ProfilePage";

export const userRoutes = {
  PROFILE_PAGE: {
    path: "/profile",
    element: ProfilePage,
    access: "user",
  },
};
