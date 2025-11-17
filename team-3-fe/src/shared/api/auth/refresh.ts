import { http } from '../http/client';
import type { SuccessResponse } from '../http/types';

export const refreshTokens = async () => {
  const resp = await http.post<SuccessResponse<{ access_token?: string; refresh_token?: string; accessToken?: string; refreshToken?: string }>>(
    '/api/v1/auth/refresh',
    { refresh_token: localStorage.getItem('refreshToken') }
  );
  return resp.data.data;
};
