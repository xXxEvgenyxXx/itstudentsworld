import { api } from '@/shared/api';
import type { CosmeticItem, CosmeticType, PaginatedResponse } from '../model/types';

export interface AdminCosmeticFilters {
  page?: number;
  search?: string;
  type?: string;
  status?: 'active' | 'deleted' | 'all';
}

export const adminCosmeticApi = {
  getAdminList: async (filters: AdminCosmeticFilters): Promise<PaginatedResponse<CosmeticItem>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    
    const { data } = await api.get<PaginatedResponse<CosmeticItem>>('/admin/cosmetic-items', { params });
    return data;
  },
  
  create: async (data: Partial<CosmeticItem>) => (await api.post('/admin/cosmetic-items', data)).data,
  update: async (id: number, data: Partial<CosmeticItem>) => (await api.patch(`/admin/cosmetic-items/${id}`, data)).data,
  delete: async (id: number) => (await api.delete(`/admin/cosmetic-items/${id}`)).data,
  restore: async (id: number) => (await api.patch(`/admin/cosmetic-items/${id}/restore`)).data,
  
  getTypes: async (): Promise<CosmeticType[]> => (await api.get('/cosmetic-types')).data,
};