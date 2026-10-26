import { Modal, Typography } from "antd";
import { usePurchase } from "../api/usePurchase";
import type { CosmeticItem } from "@/entities/cosmetic";
import { DATA_CY } from "@/shared/config";

const { Text } = Typography;

interface PurchaseModalProps {
  item: CosmeticItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseModal({ item, isOpen, onClose }: PurchaseModalProps) {
  const { mutate: purchase, isPending } = usePurchase();

  if (!item) return null;

  const handleOk = () => {
    purchase(item.id, {
      onSettled: () => {
        onClose(); // Закрываем модалку в любом случае (успех или ошибка)
      },
    });
  };

  return (
    <Modal
      okButtonProps={{ 'data-cy': DATA_CY.shop.CONFIRM_PURCHASE }}
      title="Подтверждение покупки"
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okText="Купить"
      cancelText="Отмена"
      confirmLoading={isPending}
    >
      <div style={{ padding: "20px 0" }}>
        <p>
          Вы действительно хотите купить предмет{" "}
          <Text strong>«{item.name}»</Text>?
        </p>
        <p>
          С вашего баланса будет списано{" "}
          <Text type="danger" strong>
            {Number(item.price)} монет
          </Text>
          .
        </p>
      </div>
    </Modal>
  );
}
