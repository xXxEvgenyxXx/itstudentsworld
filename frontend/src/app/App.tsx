import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { AppRouter } from './router/AppRouter';
import { AuthProvider } from './providers/AuthProvider';
import {queryClient} from './providers/QueryProvider';


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ConfigProvider понадобится для темы AntD */}
      <ConfigProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;