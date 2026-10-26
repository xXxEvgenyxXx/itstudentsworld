import { Tag, Button, Select, Popconfirm, Space } from 'antd';
import { StopOutlined, CheckCircleOutlined, WalletOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/entities/user';

const roleNames: Record<string, string> = {
  user: "Пользователь",
  admin: "Администратор",
  owner: "Владелец",
};

const roleColors: Record<string, string> = {
  owner: "purple",
  admin: "red",
  user: "blue",
};

interface GetColumnsProps {
  currentUser: User | null;
  isOwner: boolean;
  canBanUser: (targetUser: User) => boolean;
  toggleBan: (id: number) => void;
  changeRole: (params: { userId: number; role: string }) => void;
  onBalanceClick: (user: User) => void;
}

export function getAdminUsersColumns({
  currentUser,
  isOwner,
  canBanUser,
  toggleBan,
  changeRole,
  onBalanceClick,
}: GetColumnsProps): ColumnsType<User> {
  return [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Логин",
      dataIndex: "login",
      key: "login",
      render: (text: string, record: User) => (
        <span data-cy={`login-${record.id}`}>{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string, record: User) => (
        <span data-cy={`email-${record.id}`}>{text}</span>
      ),
    },
    {
      title: "Роль",
      key: "role",
      render: (_: unknown, record: User) => {
        if (isOwner && record.role.alias !== "owner" && record.id !== currentUser?.id) {
          return (
            <Select
              data-cy={`role-select-${record.id}`}
              value={record.role.alias}
              style={{ width: 150 }}
              onChange={(value) => changeRole({ userId: record.id, role: value })}
              options={[
                { value: "user", label: roleNames["user"] },
                { value: "admin", label: roleNames["admin"] },
              ]}
            />
          );
        }
        return (
          <Tag data-cy={`role-tag-${record.id}`} color={roleColors[record.role.alias]}>
            {roleNames[record.role.alias]}
          </Tag>
        );
      },
    },
    {
      title: "Баланс",
      key: "balance",
      render: (_: unknown, record: User) => (
        <span data-cy={`balance-${record.id}`} style={{ fontWeight: "bold", color: "#3f8600" }}>
          {Number(record.wallet?.balance || 0).toFixed(2)} монет
        </span>
      ),
    },
    {
      title: "Статус",
      key: "status",
      render: (_: unknown, record: User) =>
        record.is_banned ? (
          <Tag data-cy={`status-tag-${record.id}`} color="error">Забанен</Tag>
        ) : (
          <Tag data-cy={`status-tag-${record.id}`} color="success">Активен</Tag>
        ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: unknown, record: User) => {
        const isBanAllowed = canBanUser(record);

        return (
          <Space>
            {!record.is_banned && (
              <Button
                data-cy={`wallet-btn-${record.id}`}
                icon={<WalletOutlined />}
                onClick={() => onBalanceClick(record)}
              >
                Баланс
              </Button>
            )}

            {!isBanAllowed ? (
              <Button
                data-cy={`ban-btn-${record.id}`}
                type="default"
                disabled
                icon={<StopOutlined />}
                title="Недостаточно прав или действие недоступно"
              >
                Забанить
              </Button>
            ) : (
              <Popconfirm
                title={record.is_banned ? "Разбанить пользователя?" : "Забанить пользователя?"}
                onConfirm={() => toggleBan(record.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  type={record.is_banned ? "default" : "primary"}
                  danger={!record.is_banned}
                  data-cy={`ban-btn-${record.id}`}
                  icon={record.is_banned ? <CheckCircleOutlined /> : <StopOutlined />}
                >
                  {record.is_banned ? "Разбанить" : "Забанить"}
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];
}