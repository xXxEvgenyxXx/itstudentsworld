import { Row, Col } from "antd";
import { useAuth } from "@/entities/user";
import { ProfileInfo } from "@/widgets/ProfileInfo/ProfileInfo";
import { WalletCard } from "@/widgets/WalletCard/WalletCard";
import { ProfileTabs } from "@/widgets/ProfileTabs/ProfileTabs";
import { allRoutes } from "@/app/router/routes";

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const shopRoute =
    allRoutes.find((r) => r.path.includes("shop"))?.path || "/shop";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
      <h1 style={{ marginBottom: 24 }}>Личный кабинет</h1>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <ProfileInfo user={user} />
        </Col>
        <Col xs={24} md={10}>
          <WalletCard wallet={user.wallet} shopRoute={shopRoute} />
        </Col>
      </Row>

      <ProfileTabs user={user} shopRoute={shopRoute} />
    </div>
  );
}
