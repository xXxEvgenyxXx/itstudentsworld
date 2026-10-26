import { useState } from "react";
import { Select } from "antd";
import { DATA_CY } from "@/shared/config";
import { useAdminTransactions } from "@/entities/transaction";
import { AdminPageLayout } from "@/widgets/AdminPageLayout";
import { getAdminTransactionsColumns } from "./AdminTransactionsPageColumns";

export function AdminTransactionsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data, isLoading } = useAdminTransactions({
    page,
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const columns = getAdminTransactionsColumns();

  return (
    <AdminPageLayout
      title="Управление транзакциями"
      searchValue={searchInput}
      searchDataCy={DATA_CY.admin.transactions.SEARCH}
      onSearchChange={setSearchInput}
      onSearchSubmit={() => {
        setSearchQuery(searchInput);
        setPage(1);
      }}
      searchPlaceholder="Поиск по ID или логину пользователя"
      filters={
        <>
          <Select
            placeholder="Фильтр по статусу"
            allowClear
            style={{ width: 200 }}
            value={statusFilter || undefined}
            onChange={(value) => {
              setStatusFilter(value || "");
              setPage(1);
            }}
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
            style={{ width: 200 }}
            value={typeFilter || undefined}
            onChange={(value) => {
              setTypeFilter(value || "");
              setPage(1);
            }}
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