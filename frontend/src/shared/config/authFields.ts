import type { Rule } from "antd/es/form";
import { DATA_CY } from "@/shared/config";

export interface AuthFieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  dataCy?: string;
  isPassword?: boolean;
  dependencies?: string[];
  rules: Rule[];
}

// Регулярные выражения для полей
const cyrillicCapitalizedRegex = /^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)?$/;
const minecraftLoginRegex = /^[a-zA-Z0-9_]{3,16}$/;

export const loginFields: AuthFieldConfig[] = [
  {
    name: "email",
    label: "Email",
    dataCy: DATA_CY.auth.LOGIN_EMAIL,
    placeholder: "example@mail.com",
    rules: [
      { required: true, message: "Введите email" },
      { type: "email", message: "Неверный формат email" },
    ],
  },
  {
    name: "password",
    label: "Пароль",
    dataCy: DATA_CY.auth.LOGIN_PASSWORD,
    placeholder: "Введите пароль",
    isPassword: true,
    rules: [{ required: true, message: "Введите пароль" }],
  },
];

export const registerFields: AuthFieldConfig[] = [
  {
    name: "name",
    label: "Имя",
    dataCy: DATA_CY.auth.REG_NAME,
    rules: [
      { required: true, message: "Введите имя" },
      {
        pattern: cyrillicCapitalizedRegex,
        message: "Только кириллица, с заглавной буквы",
      },
    ],
  },
  {
    name: "surname",
    label: "Фамилия",
    dataCy: DATA_CY.auth.REG_SURNAME,
    rules: [
      { required: true, message: "Введите фамилию" },
      {
        pattern: cyrillicCapitalizedRegex,
        message: "Только кириллица, с заглавной буквы",
      },
    ],
  },
  {
    name: "patronymic",
    label: "Отчество (при наличии)",
    rules: [
      {
        pattern: cyrillicCapitalizedRegex,
        message: "Только кириллица, с заглавной буквы",
      },
    ],
  },
  {
    name: "email",
    label: "Email",
    dataCy: DATA_CY.auth.REG_EMAIL,
    rules: [
      { required: true, message: "Введите email" },
      { type: "email", message: "Неверный формат" },
    ],
  },
  {
    name: "login",
    label: "Игровой логин (нельзя будет изменить)",
    dataCy: DATA_CY.auth.REG_LOGIN,
    placeholder: "Steve",
    rules: [
      { required: true, message: "Введите логин" },
      {
        pattern: minecraftLoginRegex,
        message: "3-16 символов: латиница, цифры, _",
      },
    ],
  },
  {
    name: "password",
    label: "Пароль",
    dataCy: DATA_CY.auth.REG_PASSWORD,
    isPassword: true,
    rules: [{ required: true, message: "Введите пароль" }],
  },
  {
    name: "password_confirmation",
    label: "Повторите пароль",
    dataCy: DATA_CY.auth.REG_PASSWORD_CONFIRM,
    isPassword: true,
    dependencies: ["password"],
    rules: [
      { required: true, message: "Повторите пароль" },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue("password") === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error("Пароли не совпадают"));
        },
      }),
    ],
  },
];
