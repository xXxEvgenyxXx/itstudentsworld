import { useState } from 'react';
import { Row, Col, Typography, Spin, Empty, message } from 'antd';
import { useCosmetics, type CosmeticItem } from '@/entities/cosmetic';
import { CosmeticCard } from '@/widgets/CosmeticCard';
import { PurchaseModal } from '@/features/purchase-cosmetic/ui/PurchaseModal';

const { Title } = Typography;

export function ShopPage() {
  const { data, isLoading, isError } = useCosmetics();
  
  // Состояние для модалки покупки
  const [selectedItem, setSelectedItem] = useState<CosmeticItem | null>(null);

  // Временный локальный стейт для вишлиста (пока нет API)
  // Храним массив ID предметов, которые в избранном
  const [wishlist, setWishlist] = useState<number[]>([]);

  const handleWishlistToggle = (item: CosmeticItem) => {
    setWishlist((prev) => {
      if (prev.includes(item.id)) {
        message.info(`«${item.name}» удален из избранного`);
        return prev.filter((id) => id !== item.id);
      } else {
        message.success(`«${item.name}» добавлен в избранное`);
        return [...prev, item.id];
      }
    });
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  if (isError || !data) {
    return <Empty description="Не удалось загрузить магазин" />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Магазин косметики
      </Title>

      {data.data.length === 0 ? (
        <Empty description="В магазине пока нет предметов" />
      ) : (
        <Row gutter={[24, 24]}>
          {data.data.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <CosmeticCard 
                item={item} 
                isWishlisted={wishlist.includes(item.id)}
                onBuyClick={setSelectedItem}
                onWishlistToggle={handleWishlistToggle}
              />
            </Col>
          ))}
        </Row>
      )}

      <PurchaseModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}