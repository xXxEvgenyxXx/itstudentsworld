import { useState } from "react";
import { Card, Button, Space, Form } from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useUpdateProfile } from "@/entities/user/lib/useUserProfile";
import type { User } from "@/entities/user";
import { ProfileInfoView } from "./ProfileInfoView";
import { ProfileInfoEdit } from "./ProfileInfoEdit";
import { profileInfoSchema } from "./ProfileInfoEdit/model/schemas";
import { useAuth } from "@/entities/user";
import { DATA_CY } from "@/shared/config";
import s from "./ProfileInfo.module.scss";

export function ProfileInfo({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const { setUser } = useAuth();

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const result = profileInfoSchema.safeParse(values);
        if (!result.success) return;

        updateProfile(
          { userId: user.id, data: result.data },
          {
            onSuccess: (data) => {
              setIsEditing(false);
              form.resetFields();
              if (data?.user) {
                setUser(data.user);
              }
            },
          },
        );
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  return (
    <Card
      className={s.profileInfoCard}
      title={
        <>
          <UserOutlined /> Профиль игрока
        </>
      }
      variant="borderless"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", height: "100%" }}
      extra={
        !isEditing ? (
          <Button
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
            data-cy={DATA_CY.profile.EDIT_BTN}
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
              data-cy={DATA_CY.profile.SAVE_BTN}
            >
              Сохранить
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              data-cy={DATA_CY.profile.CANCEL_BTN}
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
