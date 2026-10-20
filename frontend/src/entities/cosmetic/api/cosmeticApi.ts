import { api, API } from '@/shared/api';
import type { CosmeticItem, PaginatedResponse } from '../model/types';

export const cosmeticApi = {
  fetchAll: async (type?: string): Promise<PaginatedResponse<CosmeticItem>> => {
    const params = type ? { type } : {};
    const { data } = await api.get<PaginatedResponse<CosmeticItem>>(API.cosmetics.list, { params });
    return data;
  },
};