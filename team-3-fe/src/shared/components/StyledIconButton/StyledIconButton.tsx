import { IconButton, type IconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

type CustomVariant = 'add' | 'delete';

interface StyledIconButtonProps extends IconButtonProps {
  variant?: CustomVariant;
}

export const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledIconButtonProps>(({ theme, variant }) => ({
  borderRadius: 12,
  width: 36,
  height: 36,
  fontSize: 22,
  ...(variant === 'add' && {
    color: '#FAFBFF',
    '& svg': { color: '#FAFBFF !important' },
    backgroundColor: 'var(--primary-100)',
    '&:disabled': {
      backgroundColor: '#8F90FB',
      color: '#FAFBFF66',
      '& svg': { color: '#FAFBFF66' },
    },
    '&:hover': {
      backgroundColor: '#4C4DD6',
    },
    '&:focus.Mui-focusVisible': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
  }),
  ...(variant === 'delete' && {
    color: '#221E1C',
    backgroundColor: 'transparent',
    border: '1px solid var(--divider-default)',
    '&:hover': {
      borderColor: theme.palette.primary.light,
      color: theme.palette.primary.light,
    },
    '&:focus.Mui-focusVisible': {
      borderColor: theme.palette.error.dark,
    },
  }),
}));
