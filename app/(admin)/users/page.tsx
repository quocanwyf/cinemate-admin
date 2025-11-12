"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { UsersResponse } from "@/types/user";
import { Pagination } from "@/components/ui/Pagination";
import { Search, UserX, UserCheck, Loader2 } from "lucide-react";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["users", page, search],
    queryFn: async () => {
      const response = await adminApi.getUsers({ page, limit: 10, search });
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      is_active,
    }: {
      userId: string;
      is_active: boolean;
    }) => adminApi.updateUserStatus(userId, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    if (
      confirm(
        `Bạn có chắc muốn ${
          currentStatus ? "vô hiệu hóa" : "kích hoạt"
        } user này?`
      )
    ) {
      updateStatusMutation.mutate({ userId, is_active: !currentStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg">Lỗi tải dữ liệu!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-2">Quản lý người dùng hệ thống</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo email hoặc tên..."
              className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tìm kiếm
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              className="px-4 py-2 border text-black border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ratings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Comments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.data.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.display_name || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user._count?.ratings ?? 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user._count?.comments ?? 0}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Banned"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                    disabled={updateStatusMutation.isPending}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      user.is_active
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    } disabled:opacity-50`}
                  >
                    {user.is_active ? (
                      <>
                        <UserX size={16} />
                        Ban
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        Unban
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.meta?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 text-sm text-gray-600">
        Hiển thị {data?.data.length || 0} / {data?.meta?.total || 0} users
      </div>
    </div>
  );
}
