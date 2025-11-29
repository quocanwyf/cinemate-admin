/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { User } from "@/types/user";
import { Pagination } from "@/components/ui/Pagination";
import { UserDetailModal } from "@/components/users/UserDetailModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { showToast } from "@/lib/toast";
import {
  Search,
  Ban,
  CheckCircle,
  Loader2,
  Mail,
  Calendar,
} from "lucide-react";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banDialog, setBanDialog] = useState({
    isOpen: false,
    userId: "",
    userName: "",
    currentStatus: false,
  });

  const queryClient = useQueryClient();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", currentPage, search, limit],
    queryFn: async () => {
      const response = await adminApi.getUsers({
        page: currentPage,
        limit,
        search: search || undefined,
      });
      return response.data;
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminApi.updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setBanDialog({
        isOpen: false,
        userId: "",
        userName: "",
        currentStatus: false,
      });
      showToast.success("Cập nhật trạng thái user thành công!");
    },
    onError: () => {
      showToast.error("Có lỗi xảy ra khi cập nhật trạng thái user!");
    },
  });

  const handleToggleBan = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setBanDialog({
      isOpen: true,
      userId: user.id,
      userName: user.display_name || "",
      currentStatus: user.is_active,
    });
  };

  const confirmToggleBan = () => {
    toggleUserStatusMutation.mutate({
      userId: banDialog.userId,
      isActive: !banDialog.currentStatus,
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
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
          <p className="text-lg">Lỗi tải dữ liệu users!</p>
          <p className="text-sm mt-2">{String(error)}</p>
        </div>
      </div>
    );
  }

  // ← FIX: Parse đúng response structure
  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Users</h1>
          <p className="text-gray-600 mt-2">Tổng số: {total} users</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm user..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tham gia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  {search
                    ? `Không tìm thấy user với từ khóa "${search}"`
                    : "Chưa có user nào"}
                </td>
              </tr>
            ) : (
              users.map((user: User) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name || "User avatar"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {user.display_name
                            ? user.display_name.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.display_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail size={16} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={16} />
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Hoạt động" : "Bị cấm"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => handleToggleBan(user, e)}
                      disabled={toggleUserStatusMutation.isPending}
                      className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                        user.is_active
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      } disabled:opacity-50`}
                    >
                      {user.is_active ? (
                        <>
                          <Ban size={16} />
                          Ban
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Unban
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      )}

      {/* Ban/Unban Confirmation Dialog */}
      <ConfirmDialog
        isOpen={banDialog.isOpen}
        onClose={() =>
          setBanDialog({
            isOpen: false,
            userId: "",
            userName: "",
            currentStatus: false,
          })
        }
        onConfirm={confirmToggleBan}
        title={
          banDialog.currentStatus ? "Xác nhận Ban user" : "Xác nhận Unban user"
        }
        message={`Bạn có chắc muốn ${
          banDialog.currentStatus ? "cấm" : "bỏ cấm"
        } user "${banDialog.userName}"?`}
        confirmText={banDialog.currentStatus ? "Ban" : "Unban"}
        cancelText="Hủy"
        isLoading={toggleUserStatusMutation.isPending}
      />
    </div>
  );
}
