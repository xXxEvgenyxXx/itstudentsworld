import { useState } from "react";
import { Row, Col, Typography, Spin, Empty } from "antd";
import { useCosmetics, type CosmeticItem } from "@/entities/cosmetic";
import { useAuth } from "@/entities/user";
import { CosmeticCard } from "@/widgets/CosmeticCard";
import { PurchaseModal } from "@/features/purchase-cosmetic/ui/PurchaseModal";
import { useWishlist } from "@/features/purchase-cosmetic/api/useWishlist";

const { Title } = Typography;

export function ShopPage() {
  const { data, isLoading, isError } = useCosmetics();
  const { user } = useAuth();
  const { mutate: toggleWishlist } = useWishlist();

  const [selectedItem, setSelectedItem] = useState<CosmeticItem | null>(null);

  // Массив ID предметов в избранном
  const wishlistIds = user?.wishlist?.map((item) => item.id) || [];

  // Массив ID купленных предметов
  const ownedIds = user?.cosmetics?.map((item) => item.id) || [];

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return <Empty description="Не удалось загрузить магазин" />;
  }

  return (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
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
                isWishlisted={wishlistIds.includes(item.id)}
                isOwned={ownedIds.includes(item.id)}
                onBuyClick={setSelectedItem}
                onWishlistToggle={() => toggleWishlist(item.id)}
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
