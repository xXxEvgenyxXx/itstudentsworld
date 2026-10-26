import { ReactNode } from "react";
import { Table, Input, Button, Space, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

// Используем дженерик <T>, чтобы таблица была строго типизирована
interface AdminPageLayoutProps<T> {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchPlaceholder?: string;
  searchDataCy?: string;
  filters?: ReactNode;
  actionButton?: ReactNode;
  columns: ColumnsType<T>;
  data: T[] | undefined;
  loading: boolean;
  rowKey: string | ((record: T) => React.Key);
  pagination: {
    current: number;
    total: number | undefined;
    pageSize: number;
    onChange: (page: number) => void;
  };
}

export function AdminPageLayout<T extends object>({
  title,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Поиск",
  searchDataCy = "admin-search",
  filters,
  actionButton,
  columns,
  data,
  loading,
  rowKey,
  pagination,
}: AdminPageLayoutProps<T>) {
  return (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Title level={2}>{title}</Title>
        {actionButton && <div>{actionButton}</div>}
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        {/* Блок поиска */}
        <Space.Compact style={{ width: 350 }}>
          <Input
            data-cy={searchDataCy}
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value === "") {
                onSearchSubmit(); // Сброс поиска при очистке
              }
            }}
            onPressEnter={onSearchSubmit}
            allowClear
          />
          <Button
            data-cy={`${searchDataCy}-btn`}
            type="primary"
            icon={<SearchOutlined />}
            onClick={onSearchSubmit}
          />
        </Space.Compact>

        {/* Кастомные фильтры (Select и т.д.), передаваемые со страницы */}
        {filters}
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={rowKey}
        pagination={{
          current: pagination.current,
          total: pagination.total,
          pageSize: pagination.pageSize,
          onChange: pagination.onChange,
        }}
      />
    </div>
  );
}
