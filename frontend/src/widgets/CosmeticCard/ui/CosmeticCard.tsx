import { Card, Typography, Tag, Button } from 'antd';
import { 
  ShoppingCartOutlined, 
  WalletOutlined, 
  HeartOutlined, 
  HeartFilled 
} from '@ant-design/icons';
import { useAuth } from '@/entities/user';
import type { CosmeticItem } from '@/entities/cosmetic';

const { Text } = Typography;
const { Meta } = Card;

interface CosmeticCardProps {
  item: CosmeticItem;
  isWishlisted: boolean;
  onBuyClick: (item: CosmeticItem) => void;
  onWishlistToggle: (item: CosmeticItem) => void;
}

export function CosmeticCard({ 
  item, 
  isWishlisted, 
  onBuyClick, 
  onWishlistToggle 
}: CosmeticCardProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Card
      hoverable
      cover={
        <div style={{ height: 200, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">[Картинка: {item.name}]</Text>
        </div>
      }
      actions={[
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />} 
          key="buy"
          disabled={!isAuthenticated}
          onClick={() => onBuyClick(item)}
        >
          Купить за {Number(item.price)} монет
        </Button>
      ]}
    >
      <Meta
        title={
          // Используем ellipsis для длинных названий. tooltip покажет полное имя при наведении
          <Text ellipsis={{ tooltip: item.name }} style={{ width: '100%', display: 'block' }}>
            {item.name}
          </Text>
        }
        description={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            
            {/* Категория и Сердечко в одной строке */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="blue" style={{ margin: 0 }}>
                {item.type.name}
              </Tag>
              
              <Button 
                type="text" 
                disabled={!isAuthenticated}
                onClick={() => onWishlistToggle(item)}
                icon={isWishlisted ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
              />
            </div>

            {/* Цена */}
            <Text strong style={{ fontSize: 18, color: '#3f8600' }}>
              <WalletOutlined /> {Number(item.price).toFixed(2)}
            </Text>
          </div>
        }
      />
    </Card>
  );
}