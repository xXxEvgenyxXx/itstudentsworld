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
          rules={[
            { required: true, message: "Введите сумму" },
            {
              validator: (_, value) => {
                if (value === undefined || value === null)
                  return Promise.resolve();
                const isValid = /^\d+(\.\d{1,2})?$/.test(String(value));
                if (!isValid) {
                  return Promise.reject(
                    new Error("Только числа (до 2 знаков после запятой)"),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            data-cy={DATA_CY.wallet.DEPOSIT_AMOUNT}
            min={1}
            step={100}
            precision={2}
            style={{ width: "100%" }}
            onKeyPress={(event) => {
              if (!/[0-9.]/.test(event.key)) {
                event.preventDefault();
              }
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
