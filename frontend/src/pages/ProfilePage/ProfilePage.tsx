import { Card, Descriptions, Tag, Typography, Row, Col, Statistic, Tabs, Empty, Button, List } from 'antd';
import { 
  UserOutlined, 
  WalletOutlined, 
  HistoryOutlined, 
  SkinOutlined, 
  HeartOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '@/entities/user';
import type { CosmeticItem } from '@/entities/cosmetic'; // <--- ИМПОРТ ТИПА
import { allRoutes } from '@/app/router/routes';

const { Title, Text } = Typography;

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const roleColors: Record<string, string> = {
    owner: 'purple',
    admin: 'red',
    user: 'blue',
  };

  const roleNames: Record<string, string> = {
    owner: 'Владелец',
    admin: 'Администратор',
    user: 'Пользователь',
  };

  const shopRoute = allRoutes.find((r) => r.path.includes('shop'))?.path || '/shop';

  // Строгая типизация параметра item
  const renderCosmeticItem = (item: CosmeticItem) => (
    <List.Item>
      <Card size="small" title={item.name} style={{ width: '100%' }}>
        <Tag color="blue">{item.type?.name || 'Косметика'}</Tag>
      </Card>
    </List.Item>
  );

  const tabItems = [
    {
      key: 'cosmetics',
      label: <span><SkinOutlined /> Моя косметика</span>,
      children: user.cosmetics && user.cosmetics.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={user.cosmetics}
          renderItem={renderCosmeticItem}
        />
      ) : (
        <Empty description="У вас пока нет купленной косметики">
          <Link to={shopRoute}><Button type="primary">Перейти в магазин</Button></Link>
        </Empty>
      ),
    },
    {
      key: 'wishlist',
      label: <span><HeartOutlined /> Список желаемого</span>,
      children: user.wishlist && user.wishlist.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={user.wishlist}
          renderItem={renderCosmeticItem}
        />
      ) : (
        <Empty description="Ваш список желаемого пуст">
          <Link to={shopRoute}><Button type="primary">Перейти в магазин</Button></Link>
        </Empty>
      ),
    },
    {
      key: 'transactions',
      label: <span><HistoryOutlined /> История транзакций</span>,
      children: <Empty description="История пока не реализована на фронте" />,
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Личный кабинет
      </Title>

      <Row gutter={[24, 24]}>
        {/* ЛЕВАЯ КОЛОНКА: Информация о пользователе */}
        <Col xs={24} md={14}>
          <Card 
            title={<><UserOutlined /> Профиль игрока</>} 
            bordered={false} 
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Роль">
                <Tag color={roleColors[user.role.alias] || 'default'}>
                  {roleNames[user.role.alias] || user.role.alias}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Игровой логин">
                <Text data-cy="profile-login" strong copyable>{user.login}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="ФИО">
                {user.surname} {user.name} {user.patronymic}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Дата регистрации">
                {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* ПРАВАЯ КОЛОНКА: Баланс и действия с ним */}
        <Col xs={24} md={10}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Баланс кошелька"
              value={Number(user.wallet.balance)}
              precision={2}
              prefix={<WalletOutlined />}
              suffix="монет"
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            />
            
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <Link to="#" style={{ flex: 1 }}>
                <Button type="default" block>
                  Пополнить
                </Button>
              </Link>
              
              <Link to={shopRoute} style={{ flex: 1 }}>
                <Button type="primary" block>
                  В магазин
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* НИЖНЯЯ ЧАСТЬ: Вкладки */}
      <div style={{ marginTop: 24 }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Tabs defaultActiveKey="cosmetics" items={tabItems} size="large" />
        </Card>
      </div>
    </div>
  );
}