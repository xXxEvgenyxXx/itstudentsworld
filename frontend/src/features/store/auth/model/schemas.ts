import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Имя слишком короткое"),
    surname: z.string().min(2, "Фамилия слишком короткая"),
    patronymic: z.string().optional(),
    email: z.string().email("Введите корректный email"),
    login: z
      .string()
      .min(3, "Логин от 3 до 50 символов")
      .max(50, "Логин от 3 до 50 символов")
      .regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и подчеркивания"),
    password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Пароли не совпадают",
    path: ["password_confirmation"], // Ошибка привяжется к этому полю
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
