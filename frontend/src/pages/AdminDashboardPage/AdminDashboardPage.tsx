import { Card, Col, Row, Statistic, Table, Typography } from "antd";
import { DATA_CY } from "@/shared/config";
import { useAdminDashboard } from "@/entities/admin-dashboard";
import { getAdminDashboardRecentColumns } from "./AdminDashboardPageColumns";

const { Title } = Typography;

export function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Загрузка...</div>;
  }

  if (!data) {
    return null;
  }

  const columns = getAdminDashboardRecentColumns();

  return (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Title level={2}>Панель мониторинга</Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Всего пользователей"
              value={data.stats.users.total}
              data-cy={DATA_CY.admin.dashboard.STAT_TOTAL_USERS}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              Забанено: {data.stats.users.banned} | Админов:{" "}
              {data.stats.users.admins}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Общая выручка"
              value={data.stats.transactions.revenue}
              precision={2}
              suffix="₽"
              data-cy={DATA_CY.admin.dashboard.STAT_REVENUE}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              Всего транзакций: {data.stats.transactions.total} | В ожидании:{" "}
              {data.stats.transactions.pending}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ошибки транзакций"
              value={data.stats.transactions.failed}
              data-cy={DATA_CY.admin.dashboard.STAT_FAILED_TX}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              Косметика в магазине: {data.stats.shop.total_cosmetics}
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Последние транзакции" style={{ marginTop: 24 }}>
        <Table
          dataSource={data.recent_transactions}
          rowKey="id"
          pagination={false}
          size="small"
          columns={columns}
        />
      </Card>
    </div>
  );
}
