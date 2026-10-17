import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Чтобы не спамить запросами при переключении вкладок
      retry: 1,
    },
  },
});