import type { User } from './types';
import type { SuccessResponse } from '../http/types';
import { http } from '../http/client';
import { authStorage } from '../auth/authStorage';

export const getUserMe = async (): Promise<User> => {
  const access = authStorage.getAccessToken();
  if (!access) throw new Error('AUTH_REQUIRED');

  const { data } = await http.get<SuccessResponse<User>>('/api/v1/user/me');

  const user = data?.data;
  if (!user || typeof user !== 'object') {
    throw new Error('Bad /me payload');
  }

  return user;
};
