import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { User } from './types';

export const getUsers = async (): Promise<User[]> => {
  const res = await http.get<SuccessResponse<User[]>>('/api/v1/user/admin/users');
  return res.data.data;
};
