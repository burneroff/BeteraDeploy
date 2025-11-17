import { z } from 'zod';

export const schemaDocuments = z.object({
  category_id: z.number().min(1, 'Обязательное поле'),
  accessible_role: z.number().min(1, 'Обязательное поле'),
  title: z
    .string()
    .min(1, 'Обязательное поле')
    .max(255, 'Максимум 255 символов')
    .regex(/^[\p{L}\p{N}\s_-]+$/u, 'Недопустимые символы'),
  pdf_path: z
    .instanceof(File, { message: 'Необходимо загрузить документ' })
    .refine((file) => file.type === 'application/pdf', 'Недопустимый формат файла')
    .refine((file) => file.size <= 20 * 1024 * 1024, 'Недопустимый размер файла')
    .optional(),
});

export type DocumentsFormData = z.infer<typeof schemaDocuments>;
