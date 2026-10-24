import { useState } from 'react';
import { Card, Button, Space, Form } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import { useUpdateProfile } from '@/entities/user/lib/useUserProfile';
import type { User } from '@/entities/user';
import { ProfileInfoView } from './ProfileInfoView';
import { ProfileInfoEdit } from './ProfileInfoEdit';

export function ProfileInfo({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleSave = () => {
    form.validateFields().then((values) => {
      updateProfile(
        { userId: user.id, data: values },
        {
          onSuccess: () => setIsEditing(false),
        }
      );
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  return (
    <Card 
      title={<><UserOutlined /> Профиль игрока</>} 
      bordered={false} 
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%' }}
      extra={
        !isEditing ? (
          <Button 
            icon={<EditOutlined />} 
            onClick={() => setIsEditing(true)}
            data-cy="edit-profile-btn"
          >
            Редактировать
          </Button>
        ) : (
          <Space>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSave} 
              loading={isPending}
              data-cy="save-profile-btn"
            >
              Сохранить
            </Button>
            <Button 
              icon={<CloseOutlined />} 
              onClick={handleCancel}
              data-cy="cancel-profile-btn"
            />
          </Space>
        )
      }
    >
      {isEditing ? (
        <ProfileInfoEdit user={user} form={form} />
      ) : (
        <ProfileInfoView user={user} />
      )}
    </Card>
  );
}