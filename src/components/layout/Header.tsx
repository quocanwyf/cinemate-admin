"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export function Header() {
  const { admin, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Admin Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Admin Info */}
          <div className="flex items-center gap-2 text-gray-700">
            <User size={20} />
            <div className="text-sm">
              <p className="font-medium">{admin?.full_name || "Admin"}</p>
              <p className="text-gray-500 text-xs">{admin?.email}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
