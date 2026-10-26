import { useState } from "react";
import { Select } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { DATA_CY } from "@/shared/config";
import { useAdminFilters } from "@/shared/lib/useAdminFilters";
import { useAdminUsers, useToggleBan, useChangeRole } from "@/entities/user/lib/useAdmin";
import { AdjustBalanceModal } from "@/features/admin-adjust-balance/ui/AdjustBalanceModal";
import { useAuth } from "@/entities/user";
import type { User } from "@/entities/user";
import { AdminPageLayout } from "@/widgets/AdminPageLayout";
import { getAdminUsersColumns } from "./AdminUsersPageColumns";

export function AdminUsersPage() {
  const {
    searchInput, setSearchInput,
    searchQuery, handleSearchSubmit,
    page, setPage,
    filters, setFilter,
    resetFilters, hasActiveFilters
  } = useAdminFilters({ role: "" });

  const { user: currentUser } = useAuth();
  const { data, isLoading } = useAdminUsers(page, searchQuery, filters.role);
  const { mutate: toggleBan } = useToggleBan();
  const { mutate: changeRole } = useChangeRole();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const isOwner = currentUser?.role.alias === "owner";

  const canBanUser = (targetUser: User) => {
    if (targetUser.id === currentUser?.id) return false;
    if (isOwner) return targetUser.role.alias !== "owner";
    if (currentUser?.role.alias === "admin") return targetUser.role.alias === "user";
    return false;
  };

  const columns = getAdminUsersColumns({
    currentUser, isOwner, canBanUser, toggleBan, changeRole,
    onBalanceClick: setSelectedUser,
  });

  return (
    <>
      <AdminPageLayout
        title="Управление пользователями"
        searchValue={searchInput}
        searchDataCy={DATA_CY.admin.users.SEARCH}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Поиск по логину или email"
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        filters={
          <Select
            placeholder="Фильтр по роли"
            allowClear
            clearIcon={<CloseCircleOutlined style={{ fontSize: 16 }} />}
            style={{ width: 200 }}
            value={filters.role || undefined}
            onChange={(val) => setFilter("role", val || "")}
            options={[
              { value: "user", label: "Пользователь" },
              { value: "admin", label: "Администратор" },
              { value: "owner", label: "Владелец" },
            ]}
          />
        }
        columns={columns}
        data={data?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{ current: page, total: data?.total, pageSize: 15, onChange: setPage }}
      />
      <AdjustBalanceModal user={selectedUser} isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} />
    </>
  );
}