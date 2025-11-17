// src/app/providers/ProtectedRoute/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useMe } from '@/shared/queries/user/useMe';
import { Box, CircularProgress } from '@mui/material';
import type { JSX } from 'react';

type Props = {
  element: JSX.Element;
  roles?: string[];
};

export function ProtectedRoute({ element, roles }: Props) {
  const { user, isLoading, isFetching } = useMe();

  if (isLoading || isFetching) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase())) {
    return <Navigate to="/documents" replace />;
  }

  return element;
}
