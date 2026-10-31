import { z } from "zod";

const cyrillicCapitalizedRegex = /^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)?$/;

export const profileInfoSchema = z.object({
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
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;
