import { useQuery } from '@tanstack/react-query';
import { cosmeticApi } from '../api/cosmeticApi';

export function useCosmetics(type?: string) {
  return useQuery({
    queryKey: ['cosmetics', type],
    queryFn: () => cosmeticApi.fetchAll(type),
    staleTime: 5 * 60 * 1000, // Кэшируем на 5 минут
  });
}