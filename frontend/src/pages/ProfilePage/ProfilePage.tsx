import { useState } from "react";
import { Row, Col } from "antd";
import { useAuth } from "@/entities/user";
import { ProfileInfo } from "@/widgets/ProfileInfo/ProfileInfo";
import { WalletCard } from "@/widgets/WalletCard/WalletCard";
import { ProfileTabs } from "@/widgets/ProfileTabs/ProfileTabs";
import { DepositModal } from "@/features/deposit-funds";
import { allRoutes } from "@/app/router/routes";

export function ProfilePage() {
  const { user } = useAuth();

  const [isDepositOpen, setIsDepositOpen] = useState(false);

  if (!user) return null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
      <h1 style={{ marginBottom: 24 }}>Личный кабинет</h1>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <ProfileInfo user={user} />
        </Col>
        <Col xs={24} md={10}>
          <WalletCard
            wallet={user.wallet}
            shopRoute={allRoutes.publicRoutes.SHOP_PAGE.path}
            onDepositClick={() => setIsDepositOpen(true)}
          />
        </Col>
      </Row>

      <ProfileTabs user={user} shopRoute={allRoutes.publicRoutes.SHOP_PAGE.path} />

      {/* Рендерим модалку */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />
    </div>
  );
}
