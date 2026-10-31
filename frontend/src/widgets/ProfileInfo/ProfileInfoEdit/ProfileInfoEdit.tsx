import { Form, Input } from "antd";
import type { FormInstance } from "antd";
import type { User } from "@/entities/user";
import { DATA_CY } from "@/shared/config";

const cyrillicCapitalizedRegex = /^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)?$/;

interface Props {
  user: User;
  form: FormInstance;
}

export function ProfileInfoEdit({ user, form }: Props) {
  return (
    <Form form={form} layout="vertical" initialValues={user}>
      <Form.Item
        name="name"
        label="Имя"
        rules={[
          { required: true, message: "Введите имя" },
          {
            pattern: cyrillicCapitalizedRegex,
            message: "Только кириллица, с заглавной буквы",
          },
        ]}
      >
        <Input data-cy={DATA_CY.profile.EDIT_NAME} />
      </Form.Item>

      <Form.Item
        name="surname"
        label="Фамилия"
        rules={[
          { required: true, message: "Введите фамилию" },
          {
            pattern: cyrillicCapitalizedRegex,
            message: "Только кириллица, с заглавной буквы",
          },
        ]}
      >
        <Input data-cy={DATA_CY.profile.EDIT_SURNAME} />
      </Form.Item>

      <Form.Item
        name="patronymic"
        label="Отчество"
        rules={[
          {
            pattern: cyrillicCapitalizedRegex,
            message: "Только кириллица, с заглавной буквы",
          },
        ]}
      >
        <Input data-cy={DATA_CY.profile.EDIT_PATRONYMIC} />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, type: "email", message: "Некорректный email" },
        ]}
      >
        <Input data-cy={DATA_CY.profile.EDIT_EMAIL} />
      </Form.Item>
    </Form>
  );
}
