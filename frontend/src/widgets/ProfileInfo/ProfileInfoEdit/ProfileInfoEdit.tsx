import { Form, Input } from "antd";
import type { FormInstance } from "antd";
import type { User } from "@/entities/user";

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
        rules={[{ required: true, message: "Введите имя" }]}
      >
        <Input data-cy="edit-name" />
      </Form.Item>

      <Form.Item
        name="surname"
        label="Фамилия"
        rules={[{ required: true, message: "Введите фамилию" }]}
      >
        <Input data-cy="edit-surname" />
      </Form.Item>

      <Form.Item name="patronymic" label="Отчество">
        <Input data-cy="edit-patronymic" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, type: "email", message: "Некорректный email" },
        ]}
      >
        <Input data-cy="edit-email" />
      </Form.Item>
    </Form>
  );
}
