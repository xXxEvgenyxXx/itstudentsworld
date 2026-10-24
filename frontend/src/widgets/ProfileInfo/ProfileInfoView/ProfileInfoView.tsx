import { Descriptions, Tag, Typography } from 'antd';
import type { User } from '@/entities/user';

const { Text } = Typography;

const roleNames: Record<string, string> = {
  owner: 'Владелец',
  admin: 'Администратор',
  user: 'Пользователь',
};

const roleColors: Record<string, string> = {
  owner: 'purple',
  admin: 'red',
  user: 'blue',
};

export function ProfileInfoView({ user }: { user: User }) {
  return (
    <Descriptions column={1} size="middle">
      <Descriptions.Item label="Роль">
        <Tag color={roleColors[user.role.alias]}>
          {roleNames[user.role.alias]}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Игровой логин">
        <Text data-cy="profile-login" strong copyable>
          {user.login}
        </Text>
      </Descriptions.Item>
      <Descriptions.Item label="ФИО">
        {user.surname} {user.name} {user.patronymic}
      </Descriptions.Item>
      <Descriptions.Item label="Email">
        <span data-cy="profile-email">{user.email}</span>
      </Descriptions.Item>
      <Descriptions.Item label="Дата регистрации">
        {new Date(user.created_at).toLocaleDateString('ru-RU')}
      </Descriptions.Item>
    </Descriptions>
  );
}