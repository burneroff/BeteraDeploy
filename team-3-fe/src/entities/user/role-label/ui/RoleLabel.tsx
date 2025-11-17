import { CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '@/entities/user/model/store.ts';

export const RoleLabel = () => {
  const { user } = useAuthStore();

  if (!user?.role_id) {
    return <CircularProgress size={20} />;
  }

  return <Typography color={'var(--text-soft)'}>{user?.role}</Typography>;
};
