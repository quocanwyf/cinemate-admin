"use client";

import { useState } from "react"; // ← Import useState
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { DashboardStats } from "@/types/dashboard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserDetailModal } from "@/components/users/UserDetailModal"; // ← Import modal
import {
  Users,
  UserCheck,
  Film,
  Star,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // ← State cho modal

  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await adminApi.getDashboardStats();
      return response.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-700">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p className="text-lg">Lỗi tải dữ liệu!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Tổng quan hệ thống CineMate</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Tổng người dùng"
          value={data?.totalUsers || 0}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatsCard
          title="Người dùng hoạt động"
          value={data?.activeUsers || 0}
          icon={UserCheck}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatsCard
          title="Tổng phim"
          value={data?.totalMovies || 0}
          icon={Film}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatsCard
          title="Tổng đánh giá"
          value={data?.totalRatings || 0}
          icon={Star}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatsCard
          title="Tổng bình luận"
          value={data?.totalComments || 0}
          icon={MessageSquare}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-100"
        />
        <StatsCard
          title="Bình luận đang hoạt động"
          value={data?.pendingComments || 0}
          icon={AlertCircle}
          iconColor="text-red-600"
          bgColor="bg-red-100"
        />
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Người dùng mới nhất
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.recentUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)} // ← Click để mở modal
                  className="hover:bg-blue-50 cursor-pointer transition-colors" // ← Thêm hover effect
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.display_name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ← User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      )}
    </div>
  );
}
