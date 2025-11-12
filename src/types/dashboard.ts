export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMovies: number;
  totalRatings: number;
  totalComments: number;
  pendingComments: number;
  recentUsers: RecentUser[];
}

export interface RecentUser {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}
