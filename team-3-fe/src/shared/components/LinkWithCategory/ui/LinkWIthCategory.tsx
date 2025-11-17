import { ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

interface LinkWithCategoryProps {
  label: string;
  to: string;
}

export const LinkWithCategory = ({ label, to }: LinkWithCategoryProps) => (
  <ListItem disablePadding>
    <ListItemButton component={Link} to={to} sx={{ pl: 4 }}>
      <ListItemText primary={label} />
    </ListItemButton>
  </ListItem>
);
