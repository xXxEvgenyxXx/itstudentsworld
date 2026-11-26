import { Button, Form, Input, Alert, Checkbox, Typography } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "@/entities/user";
import { registerSchema, type RegisterFormData } from "../../model/schemas";
import { parseApiError } from "@/shared/api";
import { useState } from "react";
import { DATA_CY } from "@/shared/config";
import { allRoutes } from "@/app/router/routes";
import { registerFields } from "@/shared/config";
import s from "./RegisterForm.module.scss";

const { Text } = Typography;

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
    <Form
      className={s.form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
    >
      {errorMsg && (
        <Alert
          className={s.error}
          data-cy={DATA_CY.auth.ERROR_ALERT}
          title={errorMsg}
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "24px",
          marginTop: "8px",
        }}
      >
        <Form.Item
          name="personal_data_consent"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Необходимо согласие на обработку ПДн"),
                    ),
            },
          ]}
          style={{ marginBottom: 0 }}
          data-cy="personal-data-consent-wrapper"
        >
          <Checkbox data-cy="personal-data-consent">
            <Text style={{ fontSize: 14 }}>
              Я даю согласие на обработку моих персональных данных
            </Text>
          </Checkbox>
        </Form.Item>

        <Form.Item
          name="privacy_policy_accepted"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Необходимо принять политику")),
            },
          ]}
          style={{ marginBottom: 0 }}
          data-cy="privacy-policy-accepted-wrapper"
        >
          <Checkbox data-cy="privacy-policy-accepted">
            <Text style={{ fontSize: 14 }}>
              Я ознакомлен(а) и согласен(на) с{" "}
              <Link
                to={allRoutes.publicRoutes.PRIVACY_PAGE.path}
                target="_blank"
                style={{ color: "var(--color-secondary)" }}
              >
                Политикой конфиденциальности
              </Link>
            </Text>
          </Checkbox>
        </Form.Item>
      </div>

      <Form.Item>
        <Button
          className={s.submitButton}
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
