import { Modal, Typography, Space } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import s from "./CookieSettingsModal.module.scss";

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Пока фейк чекбокс это временный костыль, с чекбоксом из Ant Design проблемы
export function CookieSettingsModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      title="Управление файлами Cookie"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      className={s.modal}
    >
      <div className={s.content}>
        <Text className={s.description}>
          Файлы cookie помогают нам идентифицировать пользователей, сохранять выбранные вами настройки, 
          собирать статистику посещаемости, а также обеспечивать безопасность ресурса от подозрительной активности.
        </Text>

        <div className={s.cookieGroup}>
          <Space align="start" size="middle">
            <div className={s.fakeCheckbox}>
              <CheckOutlined className={s.fakeCheckboxIcon} />
            </div>
            
            <div>
              <Text className={s.groupTitle}>Основные</Text>
              <Text className={s.groupDescription}>
                Эти файлы cookie необходимы для корректной работы сайта, без них сайт не сможет 
                функционировать должным образом. Отключить их можно только путем изменения настроек браузера.
              </Text>
            </div>
          </Space>
        </div>
      </div>
    </Modal>
  );
}