import { useAuthStore } from '@/entities/user/model/store.ts';
import type { ReactNode } from 'react';

interface AdminStaffProps {
  children: ReactNode;
}

const AdminOnlyStaff = ({ children }: AdminStaffProps) => {
  const { user } = useAuthStore();

  if (!user || user.role_id !== 1) {
    return null;
  }

  return <>{children}</>;
};

export default AdminOnlyStaff;

export const isAdminOnlyOrStaff = (user?: { role_id?: number | null }) => {
  return !!user && (user.role_id === 1 || user.role_id === 2);
};
