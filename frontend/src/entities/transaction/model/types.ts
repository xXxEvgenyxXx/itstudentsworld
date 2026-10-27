export type TransactionStatus = "success" | "failed" | "pending";
export type TransactionType = "deposit" | "purchase" | "refund";

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  createdAt: string;
}

export interface AdminTransactionsResponse {
  data: Transaction[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface GetAdminTransactionsParams {
  page: number;
  status?: string;
  type?: string;
  search?: string;
}
