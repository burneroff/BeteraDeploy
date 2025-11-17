// LinkTab.tsx
import { AdminIcon } from '@/shared/icons/AdminIcon';
import { Tab, type TabProps } from '@mui/material';
import { Link } from 'react-router-dom';

interface LinkTabProps extends Omit<TabProps, 'label'> {
  label: string;
  value: string;
  to: string;
  active: boolean;
}

export const LinkTab = ({ label, value, to, active, ...rest }: LinkTabProps) => {
  return (
    <Tab
      component={Link}
      label={label}
      to={to}
      icon={<AdminIcon />}
      iconPosition="start"
      {...rest}
      value={value}
      sx={() => ({
        ...(active && {
          color: '#3F41D6',
          '& svg': { color: '#3F41D6' },
        }),
      })}
    />
  );
};
