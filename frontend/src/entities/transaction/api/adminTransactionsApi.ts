import { api } from "@/shared/api";
import type { AdminTransactionsResponse, GetAdminTransactionsParams } from "../model/types";

export async function getAdminTransactions(params: GetAdminTransactionsParams) {
  const { data } = await api.get<AdminTransactionsResponse>("/admin/transactions", { params });
  return data;
}