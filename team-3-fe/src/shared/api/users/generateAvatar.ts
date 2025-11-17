// src/shared/api/user/generateAvatar.ts
import { http } from '@/shared/api/http/client';
import type { GenerateAvatarResp } from './types';

export const generateAvatar = async (): Promise<GenerateAvatarResp> => {
  const { data } = await http.post<GenerateAvatarResp>('/api/v1/user/avatar/generate');
  return data;
};
