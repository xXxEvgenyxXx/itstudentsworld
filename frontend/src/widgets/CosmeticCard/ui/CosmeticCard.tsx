import { Card, Typography, Tag, Button } from "antd";
import {
  ShoppingCartOutlined,
  WalletOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/entities/user";
import type { CosmeticItem } from "@/entities/cosmetic";
import { DATA_CY } from "@/shared/config";

const { Text } = Typography;
const { Meta } = Card;

interface CosmeticCardProps {
  item: CosmeticItem;
  isWishlisted: boolean;
  isOwned: boolean;
  onBuyClick: (item: CosmeticItem) => void;
  onWishlistToggle: (item: CosmeticItem) => void;
}

export function CosmeticCard({
  item,
  isWishlisted,
  isOwned,
  onBuyClick,
  onWishlistToggle,
}: CosmeticCardProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Card
      hoverable
      cover={
        <div
          style={{
            height: 200,
            background: "#f0f2f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text type="secondary">[Картинка: {item.name}]</Text>
        </div>
      }
      actions={[
        <Button
          data-cy={DATA_CY.shop.BUY_BTN(item.id)}
          type={isOwned ? "default" : "primary"}
          icon={isOwned ? <CheckCircleOutlined /> : <ShoppingCartOutlined />}
          key="buy"
          disabled={!isAuthenticated || isOwned} // Блокируем, если не авторизован или уже куплен
          onClick={() => onBuyClick(item)}
        >
          {isOwned ? "Уже куплено" : `Купить за ${Number(item.price)} монет`}
        </Button>,
      ]}
    >
      <Meta
        title={
          <Text
            ellipsis={{ tooltip: item.name }}
            style={{ width: "100%", display: "block" }}
          >
            {item.name}
          </Text>
        }
        description={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Tag color="blue" style={{ margin: 0 }}>
                {item.type.name}
              </Tag>

              <Button
                data-cy={DATA_CY.shop.WISHLIST_BTN(item.id)}
                type="text"
                disabled={!isAuthenticated}
                onClick={() => onWishlistToggle(item)}
                icon={
                  isWishlisted ? (
                    <HeartFilled style={{ color: "#ff4d4f" }} />
                  ) : (
                    <HeartOutlined />
                  )
                }
              />
            </div>

            <Text
              strong
              style={{ fontSize: 18, color: isOwned ? "#8c8c8c" : "#3f8600" }}
            >
              <WalletOutlined /> {Number(item.price).toFixed(2)}
            </Text>
          </div>
        }
      />
    </Card>
  );
}
