"use client";

import { useHydration } from "@/hooks/useHydration";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { admin, logout } = useAuthStore();
  const router = useRouter();
  const hydrated = useHydration();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Welcome to Dashboard!
          </h1>
          <p className="text-gray-600 mb-4">
            Xin chào, <strong>{admin?.email}</strong>
          </p>
          {admin?.full_name && (
            <p className="text-gray-600 mb-4">
              Tên: <strong>{admin.full_name}</strong>
            </p>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
