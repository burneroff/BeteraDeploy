import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { User } from './types';

export const getUserById = async (id: number): Promise<User> => {
  const res = await http.get<SuccessResponse<User>>('/api/v1/auth/user', { params: { id } });
  return res.data.data;
};
