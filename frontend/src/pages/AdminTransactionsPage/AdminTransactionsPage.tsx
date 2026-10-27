import { Select } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { DATA_CY } from "@/shared/config";
import { useAdminFilters } from "@/shared/lib/useAdminFilters"; // Импорт хука
import { useAdminTransactions } from "@/entities/transaction";
import { AdminPageLayout } from "@/widgets/AdminPageLayout";
import { getAdminTransactionsColumns } from "./AdminTransactionsPageColumns";

export function AdminTransactionsPage() {
  const {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearchSubmit,
    page,
    setPage,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
  } = useAdminFilters({ status: "", type: "" });

  const { data, isLoading } = useAdminTransactions({
    page,
    search: searchQuery || undefined,
    status: filters.status || undefined,
    type: filters.type || undefined,
  });

  const columns = getAdminTransactionsColumns();

  return (
    <AdminPageLayout
      title="Управление транзакциями"
      searchValue={searchInput}
      searchDataCy={DATA_CY.admin.transactions.SEARCH}
      onSearchChange={setSearchInput}
      onSearchSubmit={handleSearchSubmit}
      searchPlaceholder="Поиск по ID или логину пользователя"
      hasActiveFilters={hasActiveFilters}
      onResetFilters={resetFilters}
      filters={
        <>
          <Select
            placeholder="Фильтр по статусу"
            allowClear
            clearIcon={<CloseCircleOutlined style={{ fontSize: 16 }} />}
            style={{ width: 200 }}
            value={filters.status || undefined}
            onChange={(val) => setFilter("status", val || "")}
            data-cy={DATA_CY.admin.transactions.STATUS_FILTER}
            options={[
              { value: "success", label: "Успешно" },
              { value: "failed", label: "Ошибка" },
              { value: "pending", label: "В ожидании" },
            ]}
          />
          <Select
            placeholder="Фильтр по типу"
            allowClear
            clearIcon={<CloseCircleOutlined style={{ fontSize: 16 }} />}
            style={{ width: 200 }}
            value={filters.type || undefined}
            onChange={(val) => setFilter("type", val || "")}
            data-cy={DATA_CY.admin.transactions.TYPE_FILTER}
            options={[
              { value: "deposit", label: "Пополнение" },
              { value: "purchase", label: "Покупка" },
              { value: "refund", label: "Возврат" },
            ]}
          />
        </>
      }
      columns={columns}
      data={data?.data}
      loading={isLoading}
      rowKey="id"
      pagination={{
        current: page,
        total: data?.total,
        pageSize: 15,
        onChange: setPage,
      }}
    />
  );
}
