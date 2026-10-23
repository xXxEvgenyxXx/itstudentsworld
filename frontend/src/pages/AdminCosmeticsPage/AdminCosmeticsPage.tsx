import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, Space, Image, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import type { CosmeticItem } from '@/entities/cosmetic';
import { 
  useAdminCosmetics,
  useCosmeticTypes, 
  useCreateCosmetic, 
  useUpdateCosmetic, 
  useDeleteCosmetic,
  useRestoreCosmetic
} from '@/entities/cosmetic/lib/useAdminCosmetics';

export function AdminCosmeticsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'deleted' | 'all'>('active');

  const { data: cosmeticsData, isLoading } = useAdminCosmetics({ page, search, type: typeFilter, status: statusFilter });
  const { data: types } = useCosmeticTypes();
  
  const { mutate: createItem, isPending: isCreating } = useCreateCosmetic();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCosmetic();
  const { mutate: deleteItem } = useDeleteCosmetic();
  const { mutate: restoreItem } = useRestoreCosmetic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CosmeticItem | null>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (item?: CosmeticItem) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        updateItem({ id: editingItem.id, data: values }, {
          onSuccess: () => setIsModalOpen(false)
        });
      } else {
        createItem(values, {
          onSuccess: () => setIsModalOpen(false)
        });
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Превью',
      key: 'image',
      render: (_: unknown, record: CosmeticItem) => (
        <Image width={40} src={record.image_url} fallback="https://via.placeholder.com/40" />
      ),
    },
    { 
      title: 'Название', 
      dataIndex: 'name', 
      key: 'name',
      render: (text: string, record: CosmeticItem) => (
        <span style={{ textDecoration: record.deleted_at ? 'line-through' : 'none', color: record.deleted_at ? '#aaa' : 'inherit' }}>
          {text}
        </span>
      )
    },
    { 
      title: 'Тип', 
      key: 'type', 
      render: (_: unknown, record: CosmeticItem) => <Tag color="blue">{record.type?.name}</Tag> 
    },
    { 
      title: 'Цена', 
      dataIndex: 'price', 
      key: 'price', 
      render: (price: string) => `${Number(price).toFixed(2)}` 
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_: unknown, record: CosmeticItem) => (
        record.deleted_at ? <Tag color="error">Удален</Tag> : <Tag color="success">Активен</Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: unknown, record: CosmeticItem) => (
        <Space>
          {record.deleted_at ? (
            <Popconfirm title="Восстановить предмет?" onConfirm={() => restoreItem(record.id)} okText="Да" cancelText="Нет">
              {/* ДОБАВЛЕН data-cy */}
              <Button data-cy={`restore-cosmetic-${record.id}`} type="dashed" icon={<UndoOutlined />}>Вернуть</Button>
            </Popconfirm>
          ) : (
            <>
              <Button data-cy={`edit-cosmetic-${record.id}`} type="primary" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>
                Изменить
              </Button>
              <Popconfirm title="Удалить предмет?" onConfirm={() => deleteItem(record.id)} okText="Да" cancelText="Нет">
                {/* ПЕРЕНЕСЕН data-cy С Popconfirm НА Button */}
                <Button data-cy={`delete-cosmetic-${record.id}`} danger icon={<DeleteOutlined />}>Удалить</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1>Управление косметикой</h1>
        <Button data-cy="add-cosmetic-btn" type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Добавить предмет
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          data-cy="admin-cosmetics-search"
          placeholder="Поиск по названию" 
          value={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          style={{ width: 250 }}
        />
        <Select
          data-cy="admin-cosmetics-type-filter"
          placeholder="Тип"
          allowClear
          style={{ width: 150 }}
          value={typeFilter || undefined}
          onChange={(val) => { setTypeFilter(val || ''); setPage(1); }}
        >
          {types?.map((t) => <Select.Option key={t.id} value={t.alias}>{t.name}</Select.Option>)}
        </Select>
        <Select
          data-cy="admin-cosmetics-status-filter"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setPage(1); }}
        >
          <Select.Option value="active">Только активные</Select.Option>
          <Select.Option value="deleted">Только удаленные</Select.Option>
          <Select.Option value="all">Все предметы</Select.Option>
        </Select>
      </Space>

      <Table 
        columns={columns} 
        dataSource={cosmeticsData?.data} 
        loading={isLoading}
        rowKey="id"
        pagination={{ 
          current: page, 
          total: cosmeticsData?.total,
          pageSize: 15,
          onChange: (p) => setPage(p)
        }}
      />

      <Modal
        title={editingItem ? "Редактировать предмет" : "Создать предмет"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isCreating || isUpdating}
        okText="Сохранить"
        okButtonProps={{ id: 'save-cosmetic-btn' }}
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input id="form-name" />
          </Form.Item>
          
          <Form.Item name="type_id" label="Тип" rules={[{ required: true, message: 'Выберите тип' }]}>
            <Select id="form-type" placeholder="Выберите тип">
              {types?.map((type) => (
                <Select.Option key={type.id} value={type.id}>{type.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="price" label="Цена (монет)" rules={[{ required: true, message: 'Введите цену' }]}>
            <InputNumber id="form-price" min={0.01} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="image_url" label="Ссылка на картинку" rules={[{ required: true, message: 'Укажите путь к картинке' }]}>
            <Input id="form-image" placeholder="/images/cosmetics/example.png" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}