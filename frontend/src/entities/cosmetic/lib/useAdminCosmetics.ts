import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCosmeticApi, type AdminCosmeticFilters } from '../api/adminCosmeticApi';
import { message } from 'antd';
import type { ApiException } from '@/shared/api';
import type { CosmeticItem } from '../model/types';

export function useAdminCosmetics(filters: AdminCosmeticFilters) {
  return useQuery({
    queryKey: ['admin', 'cosmetics', filters],
    queryFn: () => adminCosmeticApi.getAdminList(filters),
  });
}

export function useCosmeticTypes() {
  return useQuery({
    queryKey: ['cosmetic-types'],
    queryFn: adminCosmeticApi.getTypes,
    staleTime: Infinity, // Типы меняются редко, кэшируем навсегда
  });
}

export function useCreateCosmetic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCosmeticApi.create,
    onSuccess: () => {
      message.success('Предмет создан');
      queryClient.invalidateQueries({ queryKey: ['admin', 'cosmetics'] }); 
    },
    onError: (error: ApiException) => message.error(error.message),
  });
}

export function useUpdateCosmetic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CosmeticItem> }) => adminCosmeticApi.update(id, data),
    onSuccess: () => {
      message.success('Предмет обновлен');
      queryClient.invalidateQueries({ queryKey: ['admin', 'cosmetics'] });
    },
    onError: (error: ApiException) => message.error(error.message),
  });
}

export function useDeleteCosmetic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCosmeticApi.delete,
    onSuccess: () => {
      message.success('Предмет удален');
      queryClient.invalidateQueries({ queryKey: ['admin', 'cosmetics'] });
    },
    onError: (error: ApiException) => message.error(error.message),
  });
}

export function useRestoreCosmetic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCosmeticApi.restore,
    onSuccess: () => {
      message.success('Предмет восстановлен');
      queryClient.invalidateQueries({ queryKey: ['admin', 'cosmetics'] });
    },
    onError: (error: ApiException) => message.error(error.message),
  });
}