import React from 'react';
import {
  Avatar,
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@/shared/icons/CloseIcon.tsx';
import { Title } from '@/shared/components/Title';
import { useViewers } from '@/shared/queries/useViewers.ts';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';

interface PopupFamilarProps {
  open: boolean;
  onClose: () => void;
}

const PopupFamilar: React.FC<PopupFamilarProps> = ({ open, onClose }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const { selectedRow } = useDocumentsGridStore();
  const { data: viewers, isLoading } = useViewers(selectedRow?.id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: isMobile
          ? {
              height: '60%',
              width: '320px',
              maxWidth: '100%',
              margin: 0,
            }
          : {
              height: '60%',
              width: '400px',
              maxWidth: '400px',
            },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: '18px',
          color: 'var(--text-dark)',
        }}
      >
        <Title sx={{ fontSize: '18px !important', height: '24px' }} text="Ознакомились" />
        <IconButton onClick={onClose} size="small">
          <CloseIcon color={'var(--bg-dark)'} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ paddingRight: '8px' }}>
        <Box
          display="flex"
          flexDirection="column"
          gap={'4px'}
          sx={{
            minHeight: '120%',
            paddingLeft: '0px',
            alignItems: 'center',
            justifyContent: isLoading ? 'center' : 'flex-start',
          }}
        >
          {/* Загрузка */}
          {isLoading ? (
            <CircularProgress size={28} sx={{ marginTop: 4 }} />
          ) : viewers && viewers.length > 0 ? (
            viewers.map((viewer, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                sx={{
                  background: '#F9F9FF',
                  borderRadius: '8px',
                  padding: '4px 4px',
                  width: '100%',
                  transition: 'background 0.2s ease',
                  '&:hover': { background: '#F1F1FF' },
                }}
              >
                <Avatar
                  src={viewer.photo_path}
                  alt={viewer.first_name || 'userImage'}
                  variant="rounded"
                  sx={{
                    width: 24,
                    height: 24,
                    background: '#E8E8FF',
                    borderRadius: '6px',
                    color: 'var(--text-dark)',
                    fontSize: '12px',
                    lineHeight: '18px',
                    fontWeight: 500,
                    marginRight: '10px',
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, fontSize: '16px', color: 'var(--text-dark)' }}
                >
                  {`${viewer.first_name || ''} ${viewer.last_name || ''}`.trim() ||
                    'Неизвестный пользователь'}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                fontSize: '14px',
                marginTop: '16px',
              }}
            >
              Пока никто не ознакомился
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PopupFamilar;
