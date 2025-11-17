import * as React from 'react';
import { TextField, MenuItem, type TextFieldProps } from '@mui/material';
import ChevronDown from '@/shared/components/RoleSelect/assets/ChevronDown.tsx';
import { useRolesStore } from '@/entities/user/role-label/model/store.ts';

type RoleOption = { id: number; name: string };

type RoleSelectProps = Omit<TextFieldProps, 'select' | 'onChange' | 'value'> & {
  id?: string;
  value?: number | undefined;
  onChange: (roleId: number) => void;
  options?: RoleOption[];
  label?: string;
  fontSize?: string;
  height?: string;
};

export const RoleSelect: React.FC<RoleSelectProps> = ({
  id,
  value = undefined,
  onChange,
  label = 'Роль',
  options,
  fontSize = '14px',
  height = '38px',
  sx,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const selectedValue = Number(event.target.value);
    onChange(selectedValue);
  };

  const { roles } = useRolesStore();
  const displayedOptions = options ?? roles;

  return (
    <TextField
      id={id}
      select
      label={label}
      value={value}
      onChange={handleChange}
      fullWidth
      variant="outlined"
      size="small"
      sx={{
        '& .MuiSelect-select': {
          fontSize,
          height,
          display: 'flex',
          alignItems: 'center',
        },
        ...sx,
      }}
      SelectProps={{
        MenuProps: {
          PaperProps: {
            sx: {
              maxHeight: 168,
              boxSizing: 'border-box',
            },
          },
        },
        IconComponent: ChevronDown,
      }}
      {...props}
    >
      {displayedOptions.map((option) => (
        <MenuItem
          key={option.id}
          value={option.id}
          sx={{ fontSize, height, display: 'flex', alignItems: 'center' }}
        >
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};
