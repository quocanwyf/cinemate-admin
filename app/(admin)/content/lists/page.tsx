"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { FeaturedListModal } from "@/components/featured-lists/FeaturedListModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { showToast } from "@/lib/toast";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Film,
  Eye,
  EyeOff,
  Calendar,
  User,
} from "lucide-react";

// ← Update interface để match backend response
interface FeaturedListResponse {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  ownerId: string;
  _count: {
    movies: number;
  };
}

export default function FeaturedListsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<FeaturedListResponse | null>(
    null
  );
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    listId: "",
    listTitle: "",
  });

  const queryClient = useQueryClient();

  const {
    data: lists,
    isLoading,
    error,
  } = useQuery<FeaturedListResponse[]>({
    queryKey: ["featured-lists"],
    queryFn: async () => {
      const response = await adminApi.getFeaturedLists();
      console.log("📋 Featured Lists Response:", response.data);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFeaturedList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-lists"] });
      setDeleteDialog({ isOpen: false, listId: "", listTitle: "" });
      showToast.success("Xóa featured list thành công!");
    },
    onError: () => {
      showToast.error("Có lỗi xảy ra khi xóa featured list!");
    },
  });

  const handleCreate = () => {
    setSelectedList(null);
    setIsModalOpen(true);
  };

  const handleEdit = (list: FeaturedListResponse) => {
    setSelectedList(list);
    setIsModalOpen(true);
  };

  const handleDelete = (list: FeaturedListResponse) => {
    setDeleteDialog({
      isOpen: true,
      listId: list.id,
      listTitle: list.title,
    });
  };

  const confirmDelete = () => {
    deleteMutation.mutate(deleteDialog.listId);
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
          <p className="text-lg">Lỗi tải dữ liệu featured lists!</p>
          <p className="text-sm mt-2">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Quản lý Featured Lists
          </h1>
          <p className="text-black mt-2">
            Tổng số: {lists?.length || 0} danh sách
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tạo mới
        </button>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists?.map((list) => (
          <div
            key={list.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 p-4 text-white">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold line-clamp-1">{list.title}</h3>
                <div className="flex items-center gap-1">
                  {list.is_published ? (
                    <Eye size={18} className="text-green-300" />
                  ) : (
                    <EyeOff size={18} className="text-red-300" />
                  )}
                </div>
              </div>
              {list.description && (
                <p className="text-sm text-blue-100 line-clamp-2">
                  {list.description}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-black">
                  <Film size={16} className="text-blue-600" />
                  <span>{list._count.movies} phim</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-black">
                  <User size={16} className="text-purple-600" />
                  <span className="text-xs truncate">
                    ID: {list.ownerId.slice(0, 8)}...
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-black mb-4">
                <Calendar size={14} />
                <span>
                  {new Date(list.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span
                  className={`px-2 py-1 rounded-full font-semibold ${
                    list.is_published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {list.is_published ? "Đã xuất bản" : "Nháp"}
                </span>
                {list.updated_at !== list.created_at && (
                  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs">
                    Đã cập nhật
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-3 flex gap-2">
              <button
                onClick={() => handleEdit(list)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit size={16} />
                Sửa
              </button>
              <button
                onClick={() => handleDelete(list)}
                disabled={deleteMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {lists?.length === 0 && (
        <div className="text-center py-12">
          <Film size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-black mb-2">
            Chưa có featured list nào
          </h3>
          <p className="text-black mb-4">
            Tạo danh sách phim nổi bật để hiển thị trên trang chủ
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo featured list đầu tiên
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <FeaturedListModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedList(null);
        }}
        list={selectedList}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, listId: "", listTitle: "" })
        }
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa featured list "${deleteDialog.listTitle}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
