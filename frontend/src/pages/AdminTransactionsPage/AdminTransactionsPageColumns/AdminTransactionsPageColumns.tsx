import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Transaction } from "@/entities/transaction";

export function getAdminTransactionsColumns(): ColumnsType<Transaction> {
  return [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },

    { title: "Пользователь", dataIndex: ["user", "login"], key: "user" },

    {
      title: "Тип",
      dataIndex: ["type", "alias"],
      key: "type",
      render: (val: string) => {
        const map: Record<string, string> = {
          deposit: "Пополнение",
          purchase: "Покупка",
          refund: "Возврат",
        };
        return map[val] || val;
      },
    },

    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `${val} ₽`,
    },

    {
      title: "Статус",
      dataIndex: ["status", "alias"],
      key: "status",
      render: (status: string) => {
        const color =
          status === "success" ? "green" : status === "failed" ? "red" : "gold";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },

    {
      title: "Дата",
      dataIndex: "created_at",
      key: "created_at",
      render: (val: string) => new Date(val).toLocaleString(),
    },
  ];
}
