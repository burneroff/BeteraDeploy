export interface DocumentEntity {
  id: number;
  title: string;
  pdf_path: string | undefined; // путь к файлу (S3 URL или null)
  user_id: number; // ID пользователя, добавившего документ
  category: { id: number; name: string }; // категория
  first_name: string;
  last_name: string;
  photo_path: string;
  role_id: number; // роль пользователя
  created_at: string;
  accessible_role?: { id: number; name: string }; // доступные роли (для админов)
  likes_count: number;
  comments_count: number;
  is_viewed: boolean;
  is_liked: boolean;
}

export interface RequestDocumentEntinty {
  count: number;
  documents: DocumentEntity[];
}

export interface UpdateDocumentDto {
  title?: string;
}

export interface CreateDocumentUploadDto {
  title: string;
  category_id: number;
  accessible_role?: number;
  file: File;
}
