import { Button, Form, Input, Alert } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "@/entities/user";
import { loginSchema, type LoginFormData } from "../model";
import { parseApiError } from "@/shared/api";
import { useState } from "react";

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();

  // Если пользователь пришел из ProtectedRoute, вернем его туда
  const from = location.state?.from?.pathname || "/profile";

  const onFinish = (values: LoginFormData) => {
    setErrorMsg(null);
    const result = loginSchema.safeParse(values);
    if (!result.success) return;

    login(values, {
      onSuccess: () => {
        navigate(from, { replace: true });
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
          data-cy="error-alert"
          message={errorMsg}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        label="Email"
        name="email"
        data-cy="login-email"
        rules={[
          { required: true, message: "Введите email" },
          { type: "email", message: "Неверный формат" },
        ]}
      >
        <Input size="large" placeholder="example@mail.com" />
      </Form.Item>

      <Form.Item
        label="Пароль"
        name="password"
        data-cy="login-password"
        rules={[{ required: true, message: "Введите пароль" }]}
      >
        <Input.Password size="large" placeholder="Введите пароль" />
      </Form.Item>

      <Form.Item>
        <Button
          data-cy="login-submit"
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isPending}
        >
          Войти
        </Button>
      </Form.Item>
    </Form>
  );
}
