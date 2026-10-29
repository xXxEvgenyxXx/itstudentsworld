import { Button, Form, Input, Alert } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "@/entities/user";
import { loginSchema, type LoginFormData } from "../model";
import { parseApiError } from "@/shared/api";
import { useState } from "react";
import { DATA_CY } from "@/shared/config";
import { loginFields } from "@/shared/config";

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();

  const from = location.state?.from?.pathname || "/profile";

  const onFinish = (values: LoginFormData) => {
    setErrorMsg(null);
    const result = loginSchema.safeParse(values);
    if (!result.success) return;

    login(values, {
      onSuccess: () => navigate(from, { replace: true }),
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

      {loginFields.map((field) => (
        <Form.Item
          key={field.name}
          label={field.label}
          name={field.name}
          rules={field.rules}
        >
          {field.isPassword ? (
            <Input.Password
              data-cy={field.dataCy}
              size="large"
              placeholder={field.placeholder}
            />
          ) : (
            <Input
              data-cy={field.dataCy}
              size="large"
              placeholder={field.placeholder}
            />
          )}
        </Form.Item>
      ))}

      <Form.Item>
        <Button
          data-cy={DATA_CY.auth.LOGIN_SUBMIT}
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