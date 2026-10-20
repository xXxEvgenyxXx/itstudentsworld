import { Card, Typography, Tag, Button } from 'antd';
import { ShoppingCartOutlined, WalletOutlined } from '@ant-design/icons';
import { useAuth } from '@/entities/user';
import type { CosmeticItem } from '@/entities/cosmetic';

const { Text } = Typography;
const { Meta } = Card;

interface CosmeticCardProps {
  item: CosmeticItem;
}

export function CosmeticCard({ item }: CosmeticCardProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Card
      hoverable
      cover={
        <div style={{ height: 200, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Заглушка вместо картинки */}
          <Text type="secondary">[Картинка: {item.name}]</Text>
        </div>
      }
      actions={[
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />} 
          key="buy"
          disabled={!isAuthenticated}
        >
          Купить за {Number(item.price)} монет
        </Button>
      ]}
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{item.name}</span>
            <Tag color="blue">{item.type.name}</Tag>
          </div>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <Text strong style={{ fontSize: 18, color: '#3f8600' }}>
              <WalletOutlined /> {Number(item.price).toFixed(2)}
            </Text>
          </div>
        }
      />
    </Card>
  );
}