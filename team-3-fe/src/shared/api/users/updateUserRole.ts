import { http } from '../http/client';

type UpdateRoleResponse = {
  status: string;
};

export async function updateUserRole(userId: number, roleId: number): Promise<void> {
  await http.put<UpdateRoleResponse>(`/api/v1/roles/change?user_id=${userId}`, {
    role_id: roleId,
  });
}
