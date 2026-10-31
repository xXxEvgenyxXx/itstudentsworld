import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { AppRouter } from "./router/AppRouter";
import { AuthProvider } from "./providers/AuthProvider";
import { queryClient } from "./providers/QueryProvider";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "'Monocraft', sans-serif", // Привязка основного шрифта к компонентам Ant Design
          },
        }}
      >
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
