import { http } from '@/shared/api/http/client';
import type { PhotoUploadResp } from './types';

export const uploadUserPhoto = async (id: number, file: File): Promise<PhotoUploadResp> => {
  const form = new FormData();
  form.append('photo', file);
  form.append('user_id', id.toString());

  const { data } = await http.post<PhotoUploadResp>('/api/v1/user/photo', form);
  return data;
};
