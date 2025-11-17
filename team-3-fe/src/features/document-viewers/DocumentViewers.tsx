import { Box, IconButton, Tooltip, CircularProgress, Typography } from '@mui/material';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import AdminStaff, { isAdminOrStaff } from '@/features/admin-staff/AdminStaff.tsx';
import { useViewsCount } from '@/shared/queries/useViewsCount.ts';
import { useAuthStore } from '@/entities/user/model/store.ts';
import { ViewIcon } from '@/shared/icons/ViewIcon.tsx';
import { useState } from 'react';
import PopupFamilar from '@/features/document-familiarized/PopupFamilar.tsx';

export default function DocumentViewers() {
  const { user } = useAuthStore();
  const { selectedRow } = useDocumentsGridStore();
  const { data: count, isLoading } = useViewsCount(selectedRow?.id);

  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {isAdminOrStaff(user) ? (
        <Tooltip title="Показать ознакомившихся">
          <IconButton sx={{ padding: 0 }} onClick={() => setOpen(true)}>
            <ViewIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <IconButton sx={{ padding: 0 }}>
          <ViewIcon />
        </IconButton>
      )}

      {isLoading ? (
        <CircularProgress size={16} thickness={4} />
      ) : (
        <Typography variant="body2">
          {Array.isArray(count) ? 0 : (count?.views_count ?? 0)}
        </Typography>
      )}
      <AdminStaff>
        <PopupFamilar open={open} onClose={() => setOpen(false)} />
      </AdminStaff>
    </Box>
  );
}
