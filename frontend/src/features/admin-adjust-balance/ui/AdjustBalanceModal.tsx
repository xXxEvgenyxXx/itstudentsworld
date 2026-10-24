import { Modal, Form, InputNumber, Select, Input } from 'antd';
import { useAdjustBalance } from '../api/useAdjustBalance';
import type { User } from '@/entities/user';

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
        }
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
      okButtonProps={{ id: 'adjust-balance-submit' }}
    >
      <Form form={form} layout="vertical" initialValues={{ type: 'accrual' }}>
        <Form.Item 
          name="type" 
          label="Действие" 
          rules={[{ required: true }]}
        >
          <Select
            data-cy="balance-type-select"
            options={[
              { value: 'accrual', label: 'Начислить (дать монеты)' },
              { value: 'deduction', label: 'Списать (забрать монеты)' },
            ]}
          />
        </Form.Item>

        <Form.Item 
          name="amount" 
          label="Сумма (монет)" 
          rules={[{ required: true, message: 'Введите сумму' }]}
        >
          <InputNumber data-cy="balance-amount-input" min={0.01} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="comment" label="Комментарий (причина)">
          <Input data-cy="balance-comment-input" placeholder="Например: компенсация за сбой или штраф" />
        </Form.Item>
      </Form>
    </Modal>
  );
}