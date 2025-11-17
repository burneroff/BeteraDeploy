import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Невалидный Email'),
  password: z.string().min(1, 'Обязательное поле'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
