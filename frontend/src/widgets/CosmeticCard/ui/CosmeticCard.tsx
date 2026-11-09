import { Card, Typography, Tag, Button } from "antd";
import {
  ShoppingCartOutlined,
  WalletOutlined,
  HeartOutlined,
  HeartFilled,
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
            background: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text type="secondary">[Картинка: {item.name}]</Text>
        </div>
      }
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

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isAuthenticated && !isOwned && (
                  <Button
                    data-cy={DATA_CY.shop.BUY_BTN(item.id)}
                    type="primary"
                    shape="circle"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => onBuyClick(item)}
                  />
                )}

                {isAuthenticated && (
                  <Button
                    data-cy={
                      isWishlisted
                        ? `${DATA_CY.shop.WISHLIST_BTN_PREFIX}-active-${item.id}`
                        : `${DATA_CY.shop.WISHLIST_BTN_PREFIX}-${item.id}`
                    }
                    type="primary"
                    shape="circle"
                    onClick={() => onWishlistToggle(item)}
                    icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
                  />
                )}
              </div>
            </div>

            <Text
              strong
              style={{
                fontSize: 18,
                color: isOwned
                  ? "var(--text-secondary)"
                  : "var(--color-success)",
              }}
            >
              {isOwned ? (
                "Куплено"
              ) : (
                <>
                  <WalletOutlined /> {Number(item.price).toFixed(2)}
                </>
              )}
            </Text>
          </div>
        }
      />
    </Card>
  );
}
