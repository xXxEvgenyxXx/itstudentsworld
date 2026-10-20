import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API, ApiException } from '@/shared/api';
import { message } from 'antd';

// Описываем структуру транзакции, которая приходит с бэкенда
interface Transaction {
  id: number;
  user_id: number;
  amount: string;
  type_id: number;
  status_id: number;
  comment: string;
  created_at: string;
}

interface PurchaseResponse {
  message: string;
  transaction: Transaction;
  new_balance: string;
}

export function usePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cosmeticId: number) => {
      const { data } = await api.post<PurchaseResponse>(API.wallet.purchase, {
        cosmetic_item_id: cosmeticId,
      });
      return data;
    },
    onSuccess: (data) => {
      message.success(`Покупка успешна! Новый баланс: ${Number(data.new_balance)} монет.`);
      
      // Инвалидируем кэш профиля (чтобы обновился баланс)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      
      // Если у нас будет кэш купленной косметики, его тоже инвалидируем
      // queryClient.invalidateQueries({ queryKey: ['user', 'cosmetics'] });
    },
    // Типизируем ошибку нашим кастомным классом
    onError: (error: ApiException) => {
      // Благодаря ApiException, мы можем просто взять message
      const errorMsg = error.message || 'Ошибка при покупке';
      message.error(errorMsg);
    },
  });
}