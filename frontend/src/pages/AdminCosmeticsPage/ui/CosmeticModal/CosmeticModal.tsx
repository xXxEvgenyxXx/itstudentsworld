import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import type { CosmeticItem } from '@/entities/cosmetic';
import { 
  useCosmeticTypes, 
  useCreateCosmetic, 
  useUpdateCosmetic 
} from '@/entities/cosmetic/lib/useAdminCosmetics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: CosmeticItem | null;
}

export function CosmeticModal({ isOpen, onClose, editingItem }: Props) {
  const [form] = Form.useForm();
  const { data: types } = useCosmeticTypes();
  
  const { mutate: createItem, isPending: isCreating } = useCreateCosmetic();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCosmetic();

  const isEditing = !!editingItem;

  // Заполняем форму, если открыли на редактирование
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        form.setFieldsValue(editingItem);
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, editingItem, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (isEditing) {
        updateItem(
          { id: editingItem.id, data: values }, 
          { onSuccess: onClose }
        );
      } else {
        createItem(values, { onSuccess: onClose });
      }
    });
  };

  return (
    <Modal
      title={isEditing ? "Редактировать предмет" : "Создать предмет"}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isCreating || isUpdating}
      okText="Сохранить"
      cancelText="Отмена"
      okButtonProps={{ id: 'save-cosmetic-btn', 'data-cy': 'save-cosmetic-btn' }}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          name="name" 
          label="Название" 
          rules={[{ required: true, message: 'Введите название' }]}
        >
          <Input id="form-name" data-cy="form-name" />
        </Form.Item>
        
        <Form.Item 
          name="type_id" 
          label="Тип" 
          rules={[{ required: true, message: 'Выберите тип' }]}
        >
          <Select id="form-type" data-cy="form-type" placeholder="Выберите тип">
            {types?.map((type) => (
              <Select.Option key={type.id} value={type.id}>
                {type.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          name="price" 
          label="Цена (монет)" 
          rules={[{ required: true, message: 'Введите цену' }]}
        >
          <InputNumber 
            id="form-price" 
            data-cy="form-price" 
            min={0.01} 
            step={0.01} 
            style={{ width: '100%' }} 
          />
        </Form.Item>

        <Form.Item 
          name="image_url" 
          label="Ссылка на картинку" 
          rules={[{ required: true, message: 'Укажите путь к картинке' }]}
        >
          <Input 
            id="form-image" 
            data-cy="form-image" 
            placeholder="/images/cosmetics/example.png" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}