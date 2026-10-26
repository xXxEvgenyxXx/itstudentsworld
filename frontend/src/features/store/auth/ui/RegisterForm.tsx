import { Button, Form, Input, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { useRegister } from "@/entities/user";
import { registerSchema, type RegisterFormData } from "../model/schemas";
import { parseApiError } from "@/shared/api";
import { useState } from "react";
import { DATA_CY } from "@/shared/config";

export function RegisterForm() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: register, isPending } = useRegister();

  const onFinish = (values: RegisterFormData) => {
    setErrorMsg(null);
    const result = registerSchema.safeParse(values);
    if (!result.success) return;

    register(values, {
      onSuccess: () => {
        navigate("/profile"); 
      },
      onError: (error) => {
        const apiError = parseApiError(error);
        setErrorMsg(apiError.message);
      },
    });
  };

  return (
    <Form layout="vertical" onFinish={onFinish} autoComplete="off">
      {errorMsg && (
        <Alert
          data-cy={DATA_CY.auth.ERROR_ALERT}
          message={errorMsg}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        label="Имя"
        name="name"
        rules={[{ required: true, message: "Введите имя" }]}
      >
        <Input data-cy={DATA_CY.auth.REG_NAME} size="large" />
      </Form.Item>

      <Form.Item
        label="Фамилия"
        name="surname"
        rules={[{ required: true, message: "Введите фамилию" }]}
      >
        <Input data-cy={DATA_CY.auth.REG_SURNAME} size="large" />
      </Form.Item>

      <Form.Item label="Отчество (при наличии)" name="patronymic">
        <Input size="large" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Введите email" },
          { type: "email", message: "Неверный формат" },
        ]}
      >
        <Input data-cy={DATA_CY.auth.REG_EMAIL} size="large" />
      </Form.Item>

      <Form.Item
        label="Игровой логин (нельзя будет изменить)"
        name="login"
        rules={[{ required: true, message: "Введите логин" }]}
      >
        <Input data-cy={DATA_CY.auth.REG_LOGIN} size="large" placeholder="Steve" />
      </Form.Item>

      <Form.Item
        label="Пароль"
        name="password"
        rules={[{ required: true, message: "Введите пароль" }]}
      >
        <Input.Password data-cy={DATA_CY.auth.REG_PASSWORD} size="large" />
      </Form.Item>

      <Form.Item
        label="Повторите пароль"
        name="password_confirmation" 
        dependencies={["password"]}
        rules={[
          { required: true, message: "Повторите пароль" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value)
                return Promise.resolve();
              return Promise.reject(new Error("Пароли не совпадают"));
            },
          }),
        ]}
      >
        <Input.Password data-cy={DATA_CY.auth.REG_PASSWORD_CONFIRM} size="large" />
      </Form.Item>

      <Form.Item>
        <Button
          data-cy={DATA_CY.auth.REG_SUBMIT}
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isPending}
        >
          Зарегистрироваться
        </Button>
      </Form.Item>
    </Form>
  );
}