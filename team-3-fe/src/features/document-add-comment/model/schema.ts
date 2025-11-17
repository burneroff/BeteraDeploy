import { z } from 'zod';

export const schemaComments = z.object({
  comment: z
    .string()
    .min(1, 'Обязательное поле')
    .max(999, 'Комментарий не должен превышать 999 символов'),
});

export type FormCommentsData = z.infer<typeof schemaComments>;
