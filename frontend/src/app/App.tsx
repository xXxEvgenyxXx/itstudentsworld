import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { AppRouter } from "./router/AppRouter";
import { AuthProvider } from "./providers/AuthProvider";
import { queryClient } from "./providers/QueryProvider";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        table={{
          scroll: { x: "max-content" },
        }}
        theme={{
          token: {
            fontFamily: "'Monocraft', sans-serif", // Привязка основного шрифта к компонентам Ant Design
            colorText: "var(--text-main)",
            colorTextHeading: "var(--text-main)",
            colorTextSecondary: "var(--text-secondary)",
            colorBorderSecondary: "var(--bg-secondary)",
            colorPrimary: "var(--color-primary)",
            colorPrimaryHover: "var(--color-primary-hover)",
            colorBgElevated: "var(--bg-secondary)",
            fontWeightStrong: 400,
          },
          components: {
            Input: {
              colorText: "var(--text-main)",
              colorBgContainer: "var(--bg-tertiary)",
              colorBorder: "var(--bg-secondary)",
              colorTextPlaceholder: "var(--text-secondary)",
              activeBorderColor: "var(--color-primary-hover)",
              hoverBorderColor: "var(--color-primary-hover)",
            },
            Card: {
              colorBgContainer: "rgba(var(--bg-main-rgb), 0.75)",
              colorBorderSecondary: "var(--bg-secondary)",
            },
            Descriptions: {
              contentColor: "var(--text-main)",
              titleColor: "var(--text-main)",
              labelColor: "var(--text-main)",
            },
            Button: {
              colorBgContainer: "var(--bg-secondary)",
              colorTextDisabled: "var(--text-secondary)",
            },
            Tabs: {
              inkBarColor: "var(--color-primary)",
              itemSelectedColor: "var(--color-primary-hover)",
              itemHoverColor: "var(--color-primary-hover)",
            },
            Table: {
              colorBgContainer: "var(--bg-tertiary)",
              headerBg: "var(--bg-secondary)",
              headerColor: "var(--text-main)",
              colorText: "var(--text-main)",
              borderColor: "var(--bg-main)",
              rowHoverBg: "var(--bg-secondary)",
              rowSelectedBg: "var(--color-hover)",
              rowSelectedHoverBg: "var(--color-hover)",
            },
            Select: {
              colorBgContainer: "var(--bg-secondary)",
              hoverBorderColor: "var(--color-primary-hover)",
              activeBorderColor: "var(--color-primary-hover)",
              selectorBg: "var(--bg-secondary)",
              colorText: "var(--text-main)",
              colorBgElevated: "var(--bg-secondary)",
              optionSelectedColor: "var(--text-main)",
              optionSelectedBg: "var(--bg-tertiary)",
              optionActiveBg: "var(--bg-tertiary)",
              colorBorder: "var(--bg-tertiary)",
              colorTextPlaceholder: "var(--text-secondary)",
              colorIcon: "var(--text-main)",
              colorIconHover: "var(--color-primary-hover)",
            },
            Menu: {
              itemBg: "var(--bg-main)",
              itemColor: "var(--text-main)",
              itemHoverColor: "var(--color-primary-hover)",
              itemSelectedColor: "var(--color-primary-hover)",
              horizontalItemSelectedColor: "var(--color-primary-hover)",
              horizontalItemHoverColor: "var(--color-primary-hover)",
              colorPrimary: "var(--color-primary)",
              colorSplit: "var(--bg-secondary)",
            },
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
