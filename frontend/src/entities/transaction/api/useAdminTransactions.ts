import { useQuery } from "@tanstack/react-query";
import { getAdminTransactions } from "./adminTransactionsApi";
import type { GetAdminTransactionsParams } from "../model/types";

export function useAdminTransactions(params: GetAdminTransactionsParams) {
  return useQuery({
    queryKey: ["admin", "transactions", params],
    queryFn: () => getAdminTransactions(params),
    placeholderData: (prev) => prev,
  });
}
