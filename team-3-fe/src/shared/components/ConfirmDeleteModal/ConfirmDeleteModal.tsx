import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import WarningIcon from '@/shared/icons/WarningIcon';
import { StyledButton } from '../StyledButton';
import CloseIcon from '@/shared/icons/CloseIcon.tsx';
import Box from '@mui/material/Box';

interface ConfirmDeleteModalProps {
  open: boolean;
  text?: string;
  deleteText?: string;
  confirmText?: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  text = 'Удалить фото?',
  deleteText = 'Нет',
  confirmText = 'Да',
  onClose,
  onConfirm,
  isPending,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-delete-title"
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: 400, // любая нужная ширина
          width: '100%',
        },
      }}
      fullWidth
    >
      <Box sx={{ position: 'absolute', left: '86.5%', top: '7%' }}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          mb: '28px',
          mt: 0,
          overflow: 'hidden',
        }}
      >
        <WarningIcon width={40} height={40} />
        <DialogTitle
          id="confirm-delete-title"
          component="h3"
          sx={{
            textAlign: 'center',
            p: 0,
            m: 0,
            fontFamily: '"Heading Now", sans-serif',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '18px',
          }}
        >
          {text}
        </DialogTitle>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', height: '40px' }}>
        <StyledButton variantStyle="outlined" color="inherit" onClick={onClose} text={deleteText} />
        <StyledButton
          variantStyle="filled"
          onClick={onConfirm}
          disabled={isPending}
          text={isPending ? 'Удаляем...' : confirmText}
        />
      </DialogActions>
    </Dialog>
  );
};
