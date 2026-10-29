import { z } from "zod";

// Регулярные выражения
const cyrillicCapitalizedRegex = /^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)?$/;
const minecraftLoginRegex = /^[a-zA-Z0-9_]{3,16}$/;

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Имя слишком короткое")
      .regex(cyrillicCapitalizedRegex, "Только кириллица, с заглавной буквы"),
    surname: z
      .string()
      .min(2, "Фамилия слишком короткая")
      .regex(cyrillicCapitalizedRegex, "Только кириллица, с заглавной буквы"),
    patronymic: z
      .string()
      .regex(cyrillicCapitalizedRegex, "Только кириллица, с заглавной буквы")
      .or(z.literal("")) // Разрешаем пустую строку
      .optional(),
    email: z.string().email("Введите корректный email"),
    login: z
      .string()
      .regex(
        minecraftLoginRegex,
        "Логин должен содержать от 3 до 16 символов: латиница, цифры и подчеркивания"
      ),
    password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Пароли не совпадают",
    path: ["password_confirmation"], // Ошибка привяжется к этому полю
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;