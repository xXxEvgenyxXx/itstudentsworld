import { ReactNode } from "react";
import { Table, Input, Button, Space, Typography } from "antd";
import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

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
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
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
  hasActiveFilters = false,
  onResetFilters,
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
        <Space.Compact style={{ width: 350 }}>
          <Input
            data-cy={searchDataCy}
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onPressEnter={onSearchSubmit}
            allowClear={{
              clearIcon: <CloseCircleOutlined style={{ fontSize: 16 }} />,
            }}
          />
          <Button
            data-cy={`${searchDataCy}-btn`}
            type="primary"
            icon={<SearchOutlined />}
            onClick={onSearchSubmit}
          />
        </Space.Compact>

        {filters}

        {onResetFilters && (
          <Button
            disabled={!hasActiveFilters}
            onClick={onResetFilters}
            data-cy="admin-reset-filters-btn"
          >
            Сбросить фильтры
          </Button>
        )}
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
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
