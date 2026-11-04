import { Card, Tabs, List, Empty, Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SkinOutlined,
  HeartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useTransactions } from "@/entities/user/lib/useUserProfile";
import type { User, Transaction } from "@/entities/user";
import type { CosmeticItem } from "@/entities/cosmetic";
import { DATA_CY } from "@/shared/config";
import s from "./ProfileTabs.module.scss";

interface Props {
  user: User;
  shopRoute: string;
}

export function ProfileTabs({ user, shopRoute }: Props) {
  const { data: transactions, isLoading: isLoadingTx } = useTransactions(user.id);

  const renderCosmetic = (item: CosmeticItem, isWishlist = false) => (
    <List.Item
      data-cy={
        isWishlist
          ? DATA_CY.profile.WISHLIST_ITEM
          : DATA_CY.profile.COSMETIC_ITEM
      }
    >
      <Card size="small" title={item.name} className={s.cosmeticCard}>
        <Tag color="blue">{item.type?.name || "Косметика"}</Tag>
      </Card>
    </List.Item>
  );

  const txColumns: ColumnsType<Transaction> = [
    {
      title: "Дата",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleString("ru-RU"),
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      render: (val: string) => `${Number(val).toFixed(2)}`,
    },
    {
      title: "Тип",
      key: "type",
      render: (_, record) => record.type.name,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (text: string | null) => text || "—",
    },
  ];

  const tabItems = [
    {
      key: "cosmetics",
      label: (
        <span data-cy={DATA_CY.profile.TAB_COSMETICS}>
          <SkinOutlined /> Моя косметика
        </span>
      ),
      children: user.cosmetics?.length ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={user.cosmetics}
          renderItem={(item) => renderCosmetic(item, false)}
        />
      ) : (
        <Empty description="У вас пока нет купленной косметики">
          <Link to={shopRoute}>
            <Button type="primary">Перейти в магазин</Button>
          </Link>
        </Empty>
      ),
    },
    {
      key: "wishlist",
      label: (
        <span data-cy={DATA_CY.profile.TAB_WISHLIST}>
          <HeartOutlined /> Список желаемого
        </span>
      ),
      children: user.wishlist?.length ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={user.wishlist}
          renderItem={(item) => renderCosmetic(item, true)}
        />
      ) : (
        <Empty description="Ваш список желаемого пуст">
          <Link to={shopRoute}>
            <Button type="primary">Перейти в магазин</Button>
          </Link>
        </Empty>
      ),
    },
    {
      key: "transactions",
      label: (
        <span data-cy={DATA_CY.profile.TAB_TRANSACTIONS}>
          <HistoryOutlined /> История транзакций
        </span>
      ),
      children: (
        <Table
          dataSource={transactions}
          columns={txColumns}
          rowKey="id"
          loading={isLoadingTx}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      ),
    },
  ];

  return (
    <Card bordered={false} className={s.tabsCard}>
      <Tabs defaultActiveKey="cosmetics" items={tabItems} size="large" />
    </Card>
  );
}