import { z } from 'zod';
export const profileFormSchema = z.object({
    firstName: z
        .string()
        .min(1, 'Поле "Имя" не должно быть пустым')
        .max(255, 'Имя не должно превышать 255 символов')
        .regex(/^[A-Za-zА-Яа-яЁё]+$/, 'Недопустимые символы'),
    lastName: z
        .string()
        .min(1, 'Поле "Фамилия" не должно быть пустым')
        .max(255, 'Фамилия не должна превышать 255 символов')
        .regex(/^[A-Za-zА-Яа-яЁё]+$/, 'Недопустимые символы'),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;