// Схема валидации
import { z } from 'zod';

export const userAddFormSchema = z.object({
  first_name: z
    .string()
    .min(1, 'Поле "Имя" не должно быть пустым')
    .max(255, 'Имя не должно превышать 255 символов')
    .regex(/^[A-Za-zА-Яа-яЁё]+$/, 'Недопустимые символы'),
  last_name: z
    .string()
    .min(1, 'Поле "Фамилия" не должно быть пустым')
    .max(255, 'Фамилия не должна превышать 255 символов')
    .regex(/^[A-Za-zА-Яа-яЁё]+$/, 'Недопустимые символы'),
  email: z.email('Невалидный Email'),
  role_id: z.number().min(1, 'Выберите роль'),
});

export type UserAddFormData = z.infer<typeof userAddFormSchema>;
