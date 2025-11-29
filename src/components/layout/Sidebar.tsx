"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Film,
  MessageSquare,
  List,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "User Management", icon: Users },
  { href: "/content/lists", label: "Featured Lists", icon: List },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/moderation/comments", label: "Comments", icon: MessageSquare },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { admin } = useAuthStore();

  // Lấy initials từ email hoặc full_name
  const getInitials = () => {
    if (admin?.full_name) {
      return admin.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return admin?.email?.slice(0, 2).toUpperCase() || "AD";
  };

  return (
    <aside className="w-64 bg-linear-to-b from-slate-900 via-slate-900 to-slate-800 text-white h-screen flex flex-col shadow-2xl border-r border-slate-700/50">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CineMate
            </h1>
            <p className="text-xs text-slate-400 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}

                  {/* Icon */}
                  <div
                    className={`
                    transition-transform duration-200
                    ${isActive ? "scale-110" : "group-hover:scale-110"}
                  `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Label */}
                  <span className="flex-1 font-medium text-sm">
                    {item.label}
                  </span>

                  {/* Hover arrow */}
                  <ChevronRight
                    className={`
                    w-4 h-4 transition-all duration-200
                    ${
                      isActive
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }
                  `}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer/Admin Info Section */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {admin?.full_name || "Admin"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {admin?.email || "admin@cinemate.com"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
