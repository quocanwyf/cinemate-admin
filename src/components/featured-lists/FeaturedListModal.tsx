/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { FeaturedList, CreateFeaturedListDto } from "@/types/featured-list";
import { Backdrop } from "../ui/Backdrop";
import { Modal } from "../ui/Modal";
import { showToast } from "@/lib/toast";
import { Search, X, Loader2, Film, Star } from "lucide-react";

interface FeaturedListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: FeaturedList | null;
}

interface SearchMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
}

export function FeaturedListModal({
  isOpen,
  onClose,
  list,
}: FeaturedListModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_published: true,
  });
  const [selectedMovies, setSelectedMovies] = useState<
    Map<number, SearchMovie>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  // Search movies
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ["search-movies", searchQuery.trim()],
    queryFn: async () => {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return [];

      console.log("🔍 Searching for:", trimmedQuery);

      const response = await adminApi.searchMovies(trimmedQuery);
      console.log("📦 Search response:", response.data);

      // Backend trả về array trực tiếp
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: searchQuery.trim().length >= 1,
    retry: false,
  });

  // ...rest of the code stays the same...

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateFeaturedListDto) =>
      adminApi.createFeaturedList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-lists"] });
      showToast.success("Tạo featured list thành công!");
      onClose();
    },
    onError: () => {
      showToast.error("Có lỗi xảy ra khi tạo featured list!");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateFeaturedListDto }) =>
      adminApi.updateFeaturedList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-lists"] });
      showToast.success("Cập nhật featured list thành công!");
      onClose();
    },
    onError: () => {
      showToast.error("Có lỗi xảy ra khi cập nhật featured list!");
    },
  });

  // Load list data when editing
  useEffect(() => {
    if (list) {
      setFormData({
        title: list.title,
        description: list.description || "",
        is_published: list.is_published,
      });

      // Load movies vào Map
      const moviesMap = new Map<number, SearchMovie>();
      list.movies?.forEach((m) => {
        moviesMap.set(m.movie_id, {
          id: m.movie.id,
          title: m.movie.title,
          poster_path: m.movie.poster_path,
          release_date: m.movie.release_date,
          vote_average: m.movie.vote_average,
        });
      });
      setSelectedMovies(moviesMap);
    } else {
      setFormData({
        title: "",
        description: "",
        is_published: true,
      });
      setSelectedMovies(new Map());
    }
  }, [list]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast.error("Vui lòng nhập tiêu đề!");
      return;
    }

    if (selectedMovies.size === 0) {
      showToast.error("Vui lòng chọn ít nhất 1 phim!");
      return;
    }

    const submitData: CreateFeaturedListDto = {
      ...formData,
      movie_ids: Array.from(selectedMovies.keys()),
    };

    if (list) {
      updateMutation.mutate({ id: list.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleAddMovie = (movie: SearchMovie) => {
    if (!selectedMovies.has(movie.id)) {
      setSelectedMovies(new Map(selectedMovies.set(movie.id, movie)));
      setSearchQuery("");
    }
  };

  const handleRemoveMovie = (movieId: number) => {
    const newMap = new Map(selectedMovies);
    newMap.delete(movieId);
    setSelectedMovies(newMap);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Backdrop isOpen={isOpen} onClose={onClose}>
      <Modal
        title={list ? "Chỉnh sửa Featured List" : "Tạo Featured List mới"}
        onClose={onClose}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="VD: Phim bom tấn 2024"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Mô tả ngắn về danh sách này..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Trạng thái
            </label>
            <select
              value={formData.is_published ? "published" : "draft"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_published: e.target.value === "published",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="published">Đã xuất bản</option>
              <option value="draft">Nháp</option>
            </select>
          </div>

          {/* Movie Search */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tìm kiếm phim <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Gõ tên phim để tìm kiếm..."
              />
            </div>

            {/* Search Results */}
            {searchQuery.trim().length >= 1 && (
              <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                {isSearching ? (
                  <div className="p-4 text-center text-black">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    <p className="text-xs mt-2">Đang tìm kiếm...</p>
                  </div>
                ) : searchError ? (
                  <div className="p-4 text-center text-red-600 text-sm">
                    Lỗi khi tìm kiếm phim. Vui lòng thử lại!
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  searchResults.slice(0, 10).map((movie: any) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => handleAddMovie(movie)}
                      disabled={selectedMovies.has(movie.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 last:border-0"
                    >
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="w-12 h-18 object-cover rounded shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-18 bg-gray-200 rounded flex items-center justify-center">
                          <Film size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-black line-clamp-1">
                          {movie.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-black">
                            {movie.release_date
                              ? new Date(movie.release_date).getFullYear()
                              : "N/A"}
                          </p>
                          {movie.vote_average && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <Star size={12} fill="currentColor" />
                              <span className="text-xs font-semibold">
                                {movie.vote_average.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedMovies.has(movie.id) && (
                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full shrink-0">
                          ✓ Đã thêm
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-black text-sm">
                    Không tìm thấy phim với từ khóa &quot;{searchQuery.trim()}
                    &quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Movies */}
          {selectedMovies.size > 0 && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Phim đã chọn ({selectedMovies.size})
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {Array.from(selectedMovies.values()).map((movie) => (
                  <div
                    key={movie.id}
                    className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="w-10 h-15 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-15 bg-gray-200 rounded flex items-center justify-center">
                        <Film size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {movie.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-black">
                          {movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : "N/A"}
                        </span>
                        {movie.vote_average && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star size={10} fill="currentColor" />
                            <span className="font-semibold">
                              {movie.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMovie(movie.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {list ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </Modal>
    </Backdrop>
  );
}
