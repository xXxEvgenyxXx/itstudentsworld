import { useState } from "react";
import { Button, Select } from "antd";
import { PlusOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { CosmeticItem } from "@/entities/cosmetic";
import {
  useAdminCosmetics,
  useCosmeticTypes,
  useDeleteCosmetic,
  useRestoreCosmetic,
} from "@/entities/cosmetic/lib/useAdminCosmetics";
import { AdminPageLayout } from "@/widgets/AdminPageLayout";
import { useAdminFilters } from "@/shared/lib/useAdminFilters";
import { getAdminCosmeticsColumns } from "./AdminCosmeticsPageColumns";
import { CosmeticModal } from "./ui";
import { DATA_CY } from "@/shared/config";

export function AdminCosmeticsPage() {
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
  } = useAdminFilters({
    type: "",
    status: "active" as "active" | "deleted" | "all",
  });

  const { data: cosmeticsData, isLoading } = useAdminCosmetics({
    page,
    search: searchQuery,
    type: filters.type,
    status: filters.status,
  });

  const { data: types } = useCosmeticTypes();
  const { mutate: deleteItem } = useDeleteCosmetic();
  const { mutate: restoreItem } = useRestoreCosmetic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CosmeticItem | null>(null);

  const columns = getAdminCosmeticsColumns({
    onEdit: (item) => {
      setEditingItem(item);
      setIsModalOpen(true);
    },
    onDelete: deleteItem,
    onRestore: restoreItem,
  });

  return (
    <>
      <AdminPageLayout
        title="Управление косметикой"
        searchDataCy={DATA_CY.admin.cosmetics.SEARCH}
        actionButton={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            data-cy={DATA_CY.admin.cosmetics.ADD_BTN}
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          >
            Добавить предмет
          </Button>
        }
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Поиск по названию"
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        filters={
          <>
            <Select
              placeholder="Тип"
              allowClear
              clearIcon={<CloseCircleOutlined style={{ fontSize: 16 }} />}
              style={{ width: 150 }}
              value={filters.type || undefined}
              onChange={(val) => setFilter("type", val || "")}
            >
              {types?.map((t) => (
                <Select.Option key={t.id} value={t.alias}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              style={{ width: 180 }}
              value={filters.status}
              onChange={(val) => setFilter("status", val)}
            >
              <Select.Option value="active">Только активные</Select.Option>
              <Select.Option value="deleted">Только удаленные</Select.Option>
              <Select.Option value="all">Все предметы</Select.Option>
            </Select>
          </>
        }
        columns={columns}
        data={cosmeticsData?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          total: cosmeticsData?.total,
          pageSize: 15,
          onChange: setPage,
        }}
      />
      <CosmeticModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
      />
    </>
  );
}
