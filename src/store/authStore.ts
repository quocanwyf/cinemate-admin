import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState, Admin } from "@/types/auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      admin: null,
      setAuth: (token: string, admin: Admin) => {
        console.log("Setting auth:", { token, admin });
        set({ accessToken: token, admin });
      },
      logout: () => set({ accessToken: null, admin: null }),
    }),
    {
      name: "admin-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        admin: state.admin,
      }),
    }
  )
);
