import { useState } from 'react';
import { Table, Tag, Button, Input, Space, Popconfirm, Select } from 'antd';
import { SearchOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAdminUsers, useToggleBan, useChangeRole } from '@/entities/user/lib/useAdmin';
import { useAuth } from '@/entities/user';
import type { User } from '@/entities/user';

// Словарь для перевода ролей
const roleNames: Record<string, string> = {
  user: 'Пользователь',
  admin: 'Администратор',
  owner: 'Владелец',
};

const roleColors: Record<string, string> = { 
  owner: 'purple', 
  admin: 'red', 
  user: 'blue' 
};

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  
  const { user: currentUser } = useAuth(); 
  const { data, isLoading } = useAdminUsers(page, search, roleFilter);
  const { mutate: toggleBan } = useToggleBan();
  const { mutate: changeRole } = useChangeRole();

  const isOwner = currentUser?.role.alias === 'owner';
  const canBanUser = (targetUser: User) => {
    // Себя банить нельзя
    if (targetUser.id === currentUser?.id) return false;
    
    // Владелец не может банить других владельцев
    if (isOwner) return targetUser.role.alias !== 'owner';
    
    // Админ может банить только обычных юзеров
    if (currentUser?.role.alias === 'admin') return targetUser.role.alias === 'user';

    return false;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Логин', dataIndex: 'login', key: 'login' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Роль',
      key: 'role',
      render: (_: unknown, record: User) => {
        if (isOwner && record.role.alias !== 'owner' && record.id !== currentUser?.id) {
          return (
            <Select
              value={record.role.alias}
              style={{ width: 150 }}
              onChange={(value) => changeRole({ userId: record.id, role: value })}
              options={[
                { value: 'user', label: roleNames['user'] },
                { value: 'admin', label: roleNames['admin'] },
              ]}
            />
          );
        }

        return <Tag color={roleColors[record.role.alias]}>{roleNames[record.role.alias]}</Tag>;
      },
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_: unknown, record: User) => (
        record.is_banned ? <Tag color="error">Забанен</Tag> : <Tag color="success">Активен</Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: unknown, record: User) => {
        const isBanAllowed = canBanUser(record);

        // Если действие недоступно, показываем неактивную кнопку с подсказкой
        if (!isBanAllowed) {
          return (
            <Button 
              type="default" 
              disabled 
              icon={<StopOutlined />}
              title="Недостаточно прав или действие недоступно"
            >
              Забанить
            </Button>
          );
        }

        // Если доступно, показываем рабочую кнопку
        return (
          <Popconfirm
            title={record.is_banned ? 'Разбанить пользователя?' : 'Забанить пользователя?'}
            onConfirm={() => toggleBan(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button 
              type={record.is_banned ? 'default' : 'primary'} 
              danger={!record.is_banned}
              icon={record.is_banned ? <CheckCircleOutlined /> : <StopOutlined />}
            >
              {record.is_banned ? 'Разбанить' : 'Забанить'}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Управление пользователями</h1>
      
      <Space style={{ marginBottom: 16 }} wrap>
        <Input 
          placeholder="Поиск по логину или email" 
          prefix={<SearchOutlined />} 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ width: 300 }}
        />
        
        {/* ФИЛЬТР ПО РОЛИ */}
        <Select
          placeholder="Фильтр по роли"
          allowClear
          style={{ width: 200 }}
          value={roleFilter || undefined}
          onChange={(value) => {
            setRoleFilter(value || '');
            setPage(1); // Сбрасываем страницу при смене фильтра
          }}
          options={[
            { value: 'user', label: roleNames['user'] },
            { value: 'admin', label: roleNames['admin'] },
            { value: 'owner', label: roleNames['owner'] },
          ]}
        />
      </Space>

      <Table 
        columns={columns} 
        dataSource={data?.data} 
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          total: data?.total,
          pageSize: 15,
          onChange: (newPage) => setPage(newPage),
        }}
      />
    </div>
  );
}