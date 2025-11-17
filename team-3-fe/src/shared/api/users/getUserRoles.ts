import type { SuccessResponse } from '../http/types';
import { http } from '../http/client';
import { authStorage } from '../auth/authStorage';


export interface UserRole {
  id: number;
  name: string;
  description?: string;
}


export const getUserRoles = async (): Promise<UserRole[]> => {
  const accessToken = authStorage.getAccessToken();
  if (!accessToken) {
    throw new Error('Нет accessToken');
  }

  const res = await http.get<SuccessResponse<UserRole[]>>('/api/v1/auth/roles', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.data.data;
};
