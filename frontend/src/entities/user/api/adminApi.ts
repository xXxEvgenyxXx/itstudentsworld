import { api } from '@/shared/api';
import type { User, PaginatedResponse } from '../model/types';

export const adminApi = {
  getUsers: async (page: number = 1, search: string = '', role: string = ''): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    
    const { data } = await api.get<PaginatedResponse<User>>('/admin/users', { params });
    return data;
  },

  toggleBan: async (userId: number): Promise<{ message: string; user: User }> => {
    const { data } = await api.patch(`/admin/users/${userId}/ban`);
    return data;
  },

  changeRole: async (userId: number, roleAlias: string): Promise<{ message: string; user: User }> => {
    const { data } = await api.patch(`/admin/users/${userId}/role`, { role_alias: roleAlias });
    return data;
  },
};