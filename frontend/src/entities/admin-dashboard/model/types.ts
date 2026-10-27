export interface DashboardStats {
  users: {
    total: number;
    banned: number;
    admins: number;
  };
  transactions: {
    total: number;
    failed: number;
    pending: number;
    revenue: number;
  };
  shop: {
    total_cosmetics: number;
  };
}

export interface RecentTransaction {
  id: number;
  amount: number;
  created_at: string;
  user: { id: number; login: string; email: string };
  type: { id: number; alias: string; name: string };
  status: { id: number; alias: string; name: string };
}

export interface AdminDashboardResponse {
  stats: DashboardStats;
  recent_transactions: RecentTransaction[];
}
