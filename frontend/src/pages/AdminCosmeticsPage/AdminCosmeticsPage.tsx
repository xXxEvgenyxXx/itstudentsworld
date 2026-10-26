import { useState } from "react";
import { Button, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { CosmeticItem } from "@/entities/cosmetic";
import {
  useAdminCosmetics,
  useCosmeticTypes,
  useDeleteCosmetic,
  useRestoreCosmetic,
} from "@/entities/cosmetic/lib/useAdminCosmetics";
import { AdminPageLayout } from "@/widgets/AdminPageLayout";
import { getAdminCosmeticsColumns } from "./AdminCosmeticsPageColumns";
import { CosmeticModal } from "./ui";

export function AdminCosmeticsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "deleted" | "all"
  >("active");

  const { data: cosmeticsData, isLoading } = useAdminCosmetics({
    page,
    search: searchQuery,
    type: typeFilter,
    status: statusFilter,
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
        actionButton={
          <Button
            type="primary"
            icon={<PlusOutlined />}
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
        onSearchSubmit={() => {
          setSearchQuery(searchInput);
          setPage(1);
        }}
        searchPlaceholder="Поиск по названию"
        filters={
          <>
            <Select
              placeholder="Тип"
              allowClear
              style={{ width: 150 }}
              value={typeFilter || undefined}
              onChange={(val) => {
                setTypeFilter(val || "");
                setPage(1);
              }}
            >
              {types?.map((t) => (
                <Select.Option key={t.id} value={t.alias}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              style={{ width: 180 }}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
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
