import { api } from "@/shared/api";
import type { User, Transaction } from "../model/types";

export const userApi = {
  updateProfile: async (
    userId: number,
    data: Partial<User>,
  ): Promise<{ message: string; user: User }> => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },

  getTransactions: async (userId: number): Promise<Transaction[]> => {
    const response = await api.get(`/users/${userId}/transactions`);
    return response.data;
  },
};
