import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';
import type { CreateUserRequest, CreateUserResponse } from './types';

export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  const res = await http.post<SuccessResponse<CreateUserResponse>>('/api/v1/auth/register', data);
  return res.data.data;
};
