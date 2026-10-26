import { Modal, Form, InputNumber, Select, Input } from "antd";
import { useAdjustBalance } from "../api/useAdjustBalance";
import type { User } from "@/entities/user";
import { DATA_CY } from "@/shared/config";

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdjustBalanceModal({ user, isOpen, onClose }: Props) {
  const [form] = Form.useForm();
  const { mutate: adjustBalance, isPending } = useAdjustBalance();

  if (!user) return null;

  const handleOk = () => {
    form.validateFields().then((values) => {
      adjustBalance(
        {
          userId: user.id,
          amount: values.amount,
          type: values.type,
          comment: values.comment,
        },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        },
      );
    });
  };

  return (
    <Modal
      title={`Корректировка баланса: ${user.login}`}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okText="Применить"
      cancelText="Отмена"
      confirmLoading={isPending}
      okButtonProps={{
        id: DATA_CY.admin.wallet.SUBMIT_BTN,
        "data-cy": DATA_CY.admin.wallet.SUBMIT_BTN,
      }}
    >
      <Form form={form} layout="vertical" initialValues={{ type: "accrual" }}>
        <Form.Item name="type" label="Действие" rules={[{ required: true }]}>
          <Select
            data-cy={DATA_CY.admin.wallet.TYPE_SELECT}
            options={[
              { value: "accrual", label: "Начислить (дать монеты)" },
              { value: "deduction", label: "Списать (забрать монеты)" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Сумма (монет)"
          rules={[{ required: true, message: "Введите сумму" }]}
        >
          <InputNumber
            data-cy={DATA_CY.admin.wallet.AMOUNT_INPUT}
            min={0.01}
            step={0.01}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="comment" label="Комментарий (причина)">
          <Input
            data-cy={DATA_CY.admin.wallet.COMMENT_INPUT}
            placeholder="Например: компенсация за сбой или штраф"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
