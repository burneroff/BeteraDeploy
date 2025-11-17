import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, type TextFieldProps } from '@mui/material';

type ValidationRule = {
  validate: (value: string) => boolean;
  message: string;
};

type IconConfig = {
  position: 'start' | 'end';
  visible?: (value: string) => boolean;
  icon: React.ReactNode;
  onClick?: (clear: () => void) => void;
};

interface StyledTextFieldProps extends Omit<TextFieldProps, 'error'> {
  label?: string;
  validationRules?: ValidationRule[];
  required?: boolean;
  icons?: IconConfig[];
  onClear?: () => void;
}

export const StyledTextField: React.FC<StyledTextFieldProps> = ({
  label,
  validationRules = [],
  required = false,
  icons = [],
  value,
  onChange,
  onClear,
  ...props
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const failedRule = validationRules.find((rule) => !rule.validate(String(value ?? '')));
  const showError = isTouched && !!failedRule;

  const clear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
    setIsTouched(false);
  };

  const renderAdornment = (position: 'start' | 'end') => {
    const filtered = icons.filter((icon) => icon.position === position);
    if (filtered.length === 0) return null;

    return (
      <InputAdornment position={position}>
        {filtered.map((icon, index) => {
          if (position === 'end' && String(value ?? '').length === 0) return null;

          return icon.onClick ? (
            <IconButton key={index} onClick={() => icon.onClick?.(clear)} edge={position}>
              {icon.icon}
            </IconButton>
          ) : (
            <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
              {icon.icon}
            </span>
          );
        })}
      </InputAdornment>
    );
  };

  return (
    <TextField
      {...props}
      label={label}
      value={value}
      variant="outlined"
      onChange={onChange}
      onBlur={(e) => {
        setIsTouched(true);
        setFocused(false);
        props.onBlur?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      error={showError}
      helperText={showError ? failedRule?.message : props.helperText}
      required={required}
      fullWidth
      InputLabelProps={{
        shrink: focused || Boolean(value),
      }}
      InputProps={{
        startAdornment: renderAdornment('start'),
        endAdornment: renderAdornment('end'),
      }}
      sx={{
        height: 36,
        '&:has(.MuiInputBase-adornedStart) .MuiInputLabel-outlined': {
          transform: 'translate(42px, 8px) scale(1)',
        },
        // при фокусе или shrink возвращаеwм label в "поднятое" состояние
        '&:has(.MuiInputBase-adornedStart).Mui-focused .MuiInputLabel-outlined, &:has(.MuiInputBase-adornedStart) .MuiInputLabel-outlined.MuiInputLabel-shrink':
          {
            transform: 'translate(14px, -6px) scale(0.75)',
          },
        '& .MuiInputLabel-outlined': {
          transition: 'transform 200ms ease-out',
        },
      }}
    />
  );
};
