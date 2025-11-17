import { http } from '@/shared/api/http/client';

export const deleteUserAccount = async (id: number): Promise<void> => {
  await http.delete(`/api/v1/user/admin/?id=${id}`);
};
