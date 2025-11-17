import { http } from '@/shared/api/http/client';
import type { Role } from './types';

const MOCK_ROLES: Role[] = [
  { id: 1, name: 'Администратор' },
  { id: 2, name: 'HR-специалист' },
  { id: 3, name: 'Менеджер' },
  { id: 4, name: 'Специалист' },
];

export const getRoles = async (): Promise<Role[]> => {
  try {
    const { data } = await http.get<Role[]>('/api/v1/roles/getall');
    return data;
  } catch {
    console.warn('⚠️ Используется мок ролей — /api/roles пока недоступен');
    return MOCK_ROLES;
  }
};
