import { http } from '@/shared/api/http/client';
import type { UpdateProfilePayload } from './types';

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const query = payload.user_id ? `?user_id=${payload.user_id}` : '';
  const { data } = await http.put(
    `/api/v1/user/profile${query}`,
    { first_name: payload.first_name, last_name: payload.last_name },
    {
      headers: { 'Content-Type': 'application/json' },
      transformRequest: [(d) => JSON.stringify(d)],
    },
  );
  return data;
};
