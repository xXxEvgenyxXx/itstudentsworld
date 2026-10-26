import { Modal, Form, InputNumber } from "antd";
import { useDeposit } from "../api/useDeposit";
import { DATA_CY } from "@/shared/config";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: Props) {
  const [form] = Form.useForm();
  const { mutate: deposit, isPending } = useDeposit();

  const handleOk = () => {
    form.validateFields().then((values) => {
      deposit(values.amount, {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      });
    });
  };

  return (
    <Modal
      title="Пополнение баланса"
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okText="Пополнить"
      cancelText="Отмена"
      confirmLoading={isPending}
      okButtonProps={{
        id: DATA_CY.wallet.DEPOSIT_SUBMIT,
        "data-cy": DATA_CY.wallet.DEPOSIT_SUBMIT,
      }}
    >
      <Form form={form} layout="vertical" initialValues={{ amount: 100 }}>
        <Form.Item
          name="amount"
          label="Сумма пополнения (монет)"
          rules={[{ required: true, message: "Введите сумму" }]}
        >
          <InputNumber
            data-cy={DATA_CY.wallet.DEPOSIT_AMOUNT}
            min={1}
            step={100}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}