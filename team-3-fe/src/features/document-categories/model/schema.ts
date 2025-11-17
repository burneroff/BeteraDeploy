import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .max(255, 'Максимальная длина 255')
    .regex(/^[\p{L}\p{N}\s_-]+$/u, 'Недопустимые данные'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
