import { Row, Col, Typography, Spin, Empty } from 'antd';
import { useCosmetics } from '@/entities/cosmetic';
import { CosmeticCard } from '@/widgets/CosmeticCard';

const { Title } = Typography;

export function ShopPage() {
  const { data, isLoading, isError } = useCosmetics();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
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
              <CosmeticCard item={item} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}