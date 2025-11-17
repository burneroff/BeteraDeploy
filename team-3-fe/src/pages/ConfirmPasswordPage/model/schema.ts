import { z } from 'zod';

export const passwordSchema = z.object({
  password: z
    .string()
    .min(6, 'Пароль не соответствует требованиям')
    .max(30, 'Пароль не соответствует требованиям')
    .regex(/^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]+$/, 'Пароль не соответствует требованиям')
    .regex(/[A-Za-z]/, 'Пароль не соответствует требованиям'),
});

export type PasswordFormData = z.infer<typeof passwordSchema>;
