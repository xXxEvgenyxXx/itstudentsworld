import { Tag, Button, Popconfirm, Space, Image } from "antd";
import { EditOutlined, DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { CosmeticItem } from "@/entities/cosmetic";

interface GetColumnsProps {
  onEdit: (item: CosmeticItem) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

export function getAdminCosmeticsColumns({
  onEdit,
  onDelete,
  onRestore,
}: GetColumnsProps): ColumnsType<CosmeticItem> {
  return [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Превью",
      key: "image",
      render: (_: unknown, record: CosmeticItem) => (
        <Image
          width={40}
          src={record.image_url}
          fallback="https://via.placeholder.com/40"
        />
      ),
    },
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: CosmeticItem) => (
        <span
          style={{
            textDecoration: record.deleted_at ? "line-through" : "none",
            color: record.deleted_at ? "#aaa" : "inherit",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Тип",
      key: "type",
      render: (_: unknown, record: CosmeticItem) => (
        <Tag color="blue">{record.type?.name}</Tag>
      ),
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
      render: (price: string) => `${Number(price).toFixed(2)}`,
    },
    {
      title: "Статус",
      key: "status",
      render: (_: unknown, record: CosmeticItem) =>
        record.deleted_at ? (
          <Tag color="error">Удален</Tag>
        ) : (
          <Tag color="success">Активен</Tag>
        ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: unknown, record: CosmeticItem) => (
        <Space>
          {record.deleted_at ? (
            <Popconfirm
              title="Восстановить предмет?"
              onConfirm={() => onRestore(record.id)}
              okText="Да"
              cancelText="Нет"
            >
              <Button
                data-cy={`restore-cosmetic-${record.id}`}
                type="dashed"
                icon={<UndoOutlined />}
              >
                Вернуть
              </Button>
            </Popconfirm>
          ) : (
            <>
              <Button
                data-cy={`edit-cosmetic-${record.id}`}
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              >
                Изменить
              </Button>
              <Popconfirm
                title="Удалить предмет?"
                onConfirm={() => onDelete(record.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  data-cy={`delete-cosmetic-${record.id}`}
                  danger
                  icon={<DeleteOutlined />}
                >
                  Удалить
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];
}
