/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
  Mail,
  Calendar,
  MessageCircle,
  Loader2,
  Film,
  Star,
  Bookmark,
  Eye,
  Monitor,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Backdrop } from "../ui/Backdrop";
import { Modal } from "../ui/Modal";

interface UserDetail {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  provider: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  _count: {
    comments: number;
    watchlists: number;
    ratings: number;
    ViewHistory: number;
    userRefreshTokens: number;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    movie: {
      id: number;
      title: string;
      poster_path: string | null;
    };
    _count: {
      replies: number;
    };
  }>;
  watchlists: Array<{
    created_at: string;
    movie: {
      id: number;
      title: string;
      poster_path: string | null;
      release_date: string | null;
      vote_average: number | null;
    };
  }>;
  ratings: Array<{
    score: number;
    updated_at: string;
    movie: {
      id: number;
      title: string;
      poster_path: string | null;
      vote_average: number | null;
    };
  }>;
  ViewHistory: Array<{
    viewed_at: string;
    movie: {
      id: number;
      title: string;
      poster_path: string | null;
      release_date: string | null;
    };
  }>;
  userRefreshTokens: Array<{
    id: string;
    device_info: string | null;
    created_at: string;
    expires_at: string;
  }>;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function UserDetailModal({
  isOpen,
  onClose,
  userId,
}: UserDetailModalProps) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<UserDetail>({
    queryKey: ["user-detail", userId],
    queryFn: async () => {
      const response = await adminApi.getUserById(userId);
      return response.data;
    },
    enabled: isOpen && !!userId,
  });

  return (
    <Backdrop isOpen={isOpen} onClose={onClose}>
      <Modal title="Chi tiết User" onClose={onClose} size="6xl">
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-600">
            Lỗi tải dữ liệu user!
          </div>
        )}

        {user && (
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-6">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">
                    {user.display_name}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={18} className="text-blue-600" />
                      <span className="text-base">
                        {user.email || "Chưa có email"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Shield size={18} className="text-purple-600" />
                      <span className="text-base capitalize">
                        {user.provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} className="text-green-600" />
                      <span className="text-base">
                        {new Date(user.created_at).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Monitor size={18} className="text-orange-600" />
                      <span className="text-base">
                        {user._count.userRefreshTokens} phiên đăng nhập
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? (
                        <>
                          <CheckCircle className="inline w-4 h-4 mr-1" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle className="inline w-4 h-4 mr-1" />
                          Bị cấm
                        </>
                      )}
                    </span>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        user.is_email_verified
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.is_email_verified
                        ? "✓ Email đã xác thực"
                        : "⚠ Chưa xác thực"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <MessageCircle className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-blue-900">
                  {user._count.comments}
                </p>
                <p className="text-sm text-blue-700 font-medium mt-1">
                  Bình luận
                </p>
              </div>
              <div className="bg-linear-to-br from-pink-50 to-pink-100 rounded-xl p-5 text-center border border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                <Bookmark className="w-10 h-10 text-pink-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-pink-900">
                  {user._count.watchlists}
                </p>
                <p className="text-sm text-pink-700 font-medium mt-1">
                  Watchlist
                </p>
              </div>
              <div className="bg-linear-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 text-center border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                <Star className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-yellow-900">
                  {user._count.ratings}
                </p>
                <p className="text-sm text-yellow-700 font-medium mt-1">
                  Đánh giá
                </p>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <Eye className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-purple-900">
                  {user._count.ViewHistory}
                </p>
                <p className="text-sm text-purple-700 font-medium mt-1">
                  Đã xem
                </p>
              </div>
            </div>

            {/* Active Sessions */}
            {user.userRefreshTokens && user.userRefreshTokens.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Monitor className="text-orange-600" size={24} />
                  Phiên đăng nhập ({user.userRefreshTokens.length})
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {user.userRefreshTokens.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <p className="text-sm text-gray-700 mb-2 truncate">
                        {session.device_info || "Unknown device"}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Đăng nhập:{" "}
                          {new Date(session.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span>
                          Hết hạn:{" "}
                          {new Date(session.expires_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Comments */}
            {user.comments && user.comments.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageCircle className="text-blue-600" size={24} />
                  Bình luận gần đây ({user.comments.length})
                </h4>
                <div className="space-y-3">
                  {user.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <p className="text-gray-800 mb-3 leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {comment.movie.poster_path && (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${comment.movie.poster_path}`}
                              alt={comment.movie.title}
                              className="w-10 h-14 object-cover rounded"
                            />
                          )}
                          <span className="text-blue-700 font-medium">
                            {comment.movie.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                          {comment._count.replies > 0 && (
                            <span>{comment._count.replies} phản hồi</span>
                          )}
                          <span>
                            {new Date(comment.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watchlist */}
            {user.watchlists && user.watchlists.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Bookmark className="text-pink-600" size={24} />
                  Watchlist ({user.watchlists.length})
                </h4>
                <div className="grid grid-cols-6 gap-4">
                  {user.watchlists.map((item) => (
                    <div key={`${item.movie.id}`} className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-all">
                        {item.movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${item.movie.poster_path}`}
                            alt={item.movie.title}
                            className="w-full h-auto group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full aspect-2/3 bg-gray-200 flex items-center justify-center">
                            <Film className="text-gray-400" size={32} />
                          </div>
                        )}
                        {item.movie.vote_average && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star size={12} fill="white" />
                            {item.movie.vote_average.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 truncate font-medium">
                        {item.movie.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Thêm:{" "}
                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ratings */}
            {user.ratings && user.ratings.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="text-yellow-600" size={24} />
                  Đánh giá ({user.ratings.length})
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {user.ratings.map((rating) => (
                    <div
                      key={`${rating.movie.id}`}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all flex gap-3"
                    >
                      {rating.movie.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${rating.movie.poster_path}`}
                          alt={rating.movie.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-2 line-clamp-2">
                          {rating.movie.title}
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1 text-yellow-600 font-bold">
                            <Star size={16} fill="currentColor" />
                            {rating.score}/5
                          </div>
                          {rating.movie.vote_average && (
                            <span className="text-xs text-gray-500">
                              (TMDB: {rating.movie.vote_average.toFixed(1)})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(rating.updated_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View History */}
            {user.ViewHistory && user.ViewHistory.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Eye className="text-purple-600" size={24} />
                  Lịch sử xem ({user.ViewHistory.length})
                </h4>
                <div className="grid grid-cols-5 gap-4">
                  {user.ViewHistory.map((history) => (
                    <div key={`${history.movie.id}`} className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-all">
                        {history.movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${history.movie.poster_path}`}
                            alt={history.movie.title}
                            className="w-full h-auto group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full aspect-2/3 bg-gray-200 flex items-center justify-center">
                            <Film className="text-gray-400" size={32} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 truncate font-medium">
                        {history.movie.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Xem:{" "}
                        {new Date(history.viewed_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Backdrop>
  );
}
