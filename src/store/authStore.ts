import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Admin } from "@/types/auth";

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;

  setAuth: (accessToken: string, adminData: Omit<Admin, "accessToken">) => void;
  setAdmin: (admin: Admin | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,

      setAuth: (accessToken, adminData) =>
        set({
          accessToken,
          admin: {
            ...adminData,
            accessToken,
          },
        }),

      setAdmin: (admin) =>
        set({
          admin,
          accessToken: admin?.accessToken || null,
        }),

      logout: () => set({ admin: null, accessToken: null }),
    }),
    {
      name: "admin-auth",
    }
  )
);
