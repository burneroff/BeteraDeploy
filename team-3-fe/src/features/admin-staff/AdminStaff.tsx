import { useAuthStore } from '@/entities/user/model/store.ts';
import type { ReactNode } from 'react';

interface AdminStaffProps {
  children: ReactNode;
}

const AdminStaff = ({ children }: AdminStaffProps) => {
  const { user } = useAuthStore();

  if (!user || (user.role_id !== 1 && user.role_id !== 2)) {
    return null;
  }

  return <>{children}</>;
};

export default AdminStaff;

export const isAdminOrStaff = (user?: { role_id?: number | null }) => {
  return !!user && (user.role_id === 1 || user.role_id === 2);
};
