import React from 'react';
import { Button, type ButtonProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

type VariantStyle = 'filled' | 'outlined' | 'custom' | 'delete';

interface ActiveButtonProps extends ButtonProps {
  text?: string;
  variantStyle?: VariantStyle;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

const buttonVariants: Record<VariantStyle, SxProps<Theme>> = {
  filled: {
    backgroundColor: 'var(--accent-default)',
    color: 'var(--text-light)',
    border: 'none',
    '&:hover': { backgroundColor: 'var(--accent-hover)' },
    '&:focus-visible': { backgroundColor: 'var(--accent-focused)' },
    '&.Mui-disabled': {
      backgroundColor: 'var(--accent-disabled)',
      color: 'var(--text-disabled-light)',
    },
  },
  outlined: {
    backgroundColor: 'transparent',
    color: 'var(--text-dark)',
    border: '1px solid var(--divider-default)',
    '&:hover': { border: '1px solid var(--accent-default)' },
    '&.Mui-disabled': { color: '#3F41D666', backgroundColor: '#E8E8FF' },
    '&:focus-visible': { border: '1px solid var(--accent-default)', backgroundColor: '#F2F2FF' },
  },
  custom: {
    backgroundColor: 'transparent',
    color: 'var(--accent-default)',
    paddingTop: 0,
    paddingLeft: '16px',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'var(--accent-hover)',
      '& svg': {
        color: 'var(--accent-hover)',
      },
    },
    '&.Mui-focusVisible': {
      backgroundColor: 'transparent',
      color: 'var(--accent-focused)',
      '& svg': {
        color: 'var(--accent-focused)',
      },
    },
    '&:active': {
      backgroundColor: 'transparent',
      color: 'var(--accent-active)',
      '& svg': {
        color: 'var(--accent-active)',
      },
    },
    '&.Mui-disabled': {
      backgroundColor: 'transparent',
      color: 'var(--accent-disabled)',
      '& svg': {
        color: 'var(--accent-disabled)',
      },
    },
  },
  delete: {
    backgroundColor: '#E8E8FF',
    color: '#5E5FDB',
    border: '1px solid var(--divider-default)',
    '&:hover': {
      backgroundColor: '#DADAFB',
    },
    '&:focus-visible': {
      backgroundColor: '#CFCFF5', // подсветка только при фокусе с клавиатуры
    },
    '&.Mui-disabled': {
      backgroundColor: '#E8E8FF',
      color: '#3F41D666',
    },
  },
};

const muiVariantMap: Record<VariantStyle, ButtonProps['variant']> = {
  filled: 'contained',
  outlined: 'outlined',
  custom: 'text',
  delete: 'outlined',
};

const baseStyles: SxProps<Theme> = {
  borderRadius: '12px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  height: 36,
};

export const StyledButton: React.FC<ActiveButtonProps> = ({
  text,
  variantStyle = 'filled',
  iconStart,
  iconEnd,
  sx,
  ...props
}) => {
  const variantStyles = buttonVariants[variantStyle];
  const muiVariant = muiVariantMap[variantStyle];

  return (
    <Button
      disableElevation
      fullWidth={variantStyle !== 'custom'}
      variant={muiVariant}
      startIcon={iconStart}
      endIcon={iconEnd}
      sx={[baseStyles, variantStyles, sx] as SxProps<Theme>}
      {...props}
    >
      {text}
    </Button>
  );
};
