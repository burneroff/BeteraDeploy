import React from 'react';
import { Box, IconButton, Slide, Snackbar, Typography } from '@mui/material';
import CloseIcon from '@/shared/icons/CloseIcon';
import WarningIcon from '@/shared/icons/WarningIcon';
import SuccessIcon from '@/shared/icons/SuccessIcon';
import theme from '@/app/theme/theme.tsx';

interface NotificationProps {
  message: string;
  onClose: () => void;
  open: boolean; // добавляем проп open
  severity?: 'success' | 'error' | 'warning' | 'info';
}

const iconMap = {
  success: <SuccessIcon width={24} height={24} />,
  error: <WarningIcon width={24} height={24} />,
  warning: <WarningIcon width={24} height={24} />,
  info: '',
};

const SlideDown = (props: any) => {
  return (
    <Slide
      {...props}
      direction="down"
      easing={{ enter: 'cubic-bezier(0.33, 1, 0.68, 1)' }}
      timeout={200}
    />
  );
};

export const Notification: React.FC<NotificationProps> = ({
  message,
  onClose,
  open,
  severity = 'success',
}) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={5000}
      slots={{
        transition: SlideDown, // ✅ Новый способ
      }}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderRadius: '16px',
          border: `1px solid var(--divider-default)`,
          boxShadow: 'none',
          bgcolor: 'var(--bg-surface-2)',
          width: 'auto',
          height: 40,
          maxWidth: 500,
          [theme.breakpoints.down(600)]: {
            maxWidth: 360,
          },
        }}
      >
        {iconMap[severity]}
        <Typography
          sx={{
            flex: 1,
            fontSize: '14px',
            [theme.breakpoints.down(600)]: {
              fontSize: '12px',
            },
            fontWeight: 500,
            color: 'var(--text-dark)',
          }}
        >
          {message}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Snackbar>
  );
};
