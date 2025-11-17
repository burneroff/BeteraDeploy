import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, type TextFieldProps } from '@mui/material';
import CloseIcon from '@/shared/icons/CloseIcon.tsx';
import { SearchIcon } from '@/shared/icons/SearchIcon.tsx';


interface SearchProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSearchQuery?: (query: string) => void;
}

export const Search: React.FC<SearchProps> = ({
  sx,
  onChange,
  value: externalValue,
  setSearchQuery,
  ...props
}) => {
  const [value, setValue] = useState<string>(externalValue?.toString() || '');
  const isActive = value.trim().length > 0; // 🔹 флаг активности, если есть текст

  // 🔹 Дебаунс: обновляем setSearchQuery через 300мс после ввода
  useEffect(() => {
    if (!setSearchQuery) return;

    const handler = setTimeout(() => {
      setSearchQuery(value);
    }, 300);

    return () => clearTimeout(handler);
  }, [value, setSearchQuery]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value.replace(/\s+/g, ''));
    onChange?.(event); // передаём наверх, если нужно
  };

  const handleClear = () => {
    setValue('');
    onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    setSearchQuery?.('');
  };

  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      placeholder="Поиск"
      value={value}
      onChange={handleChange}
      sx={{
        '& .MuiOutlinedInput-root': {
          ...(isActive && {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--primary-300)',
              borderWidth: '2px',
            },
          }),
        },
        ...sx,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon width={20} height={20} />
          </InputAdornment>
        ),
        endAdornment: isActive ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{ color: '#A0A3C4', '&:hover': { color: '#4C4DD6' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      {...props}
    />
  );
};
