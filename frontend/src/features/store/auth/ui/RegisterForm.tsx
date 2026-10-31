import { Button, Form, Input, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { useRegister } from "@/entities/user";
import { registerSchema, type RegisterFormData } from "../model/schemas";
import { parseApiError } from "@/shared/api";
import { useState } from "react";
import { DATA_CY } from "@/shared/config";
import { registerFields } from "@/shared/config";

export function RegisterForm() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: register, isPending } = useRegister();

  const onFinish = (values: RegisterFormData) => {
    setErrorMsg(null);
    const result = registerSchema.safeParse(values);
    if (!result.success) return;

    register(values, {
      onSuccess: () => navigate("/profile"),
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

      {registerFields.map((field) => (
        <Form.Item
          key={field.name}
          label={field.label}
          name={field.name}
          rules={field.rules}
          dependencies={field.dependencies}
          data-cy={`${field.dataCy}-wrapper`}
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