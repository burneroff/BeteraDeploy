import CloseIcon from '@/shared/icons/CloseIcon';
import MenuIcon from '@/shared/icons/MenuIcon';
import { IconButton } from '@mui/material';

type BurgerButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export const BurgerButton = ({ isOpen, onClick }: BurgerButtonProps) => (
  <IconButton onClick={onClick}  color="inherit" aria-label="menu" sx={{padding: 0}}>
    {isOpen ? <CloseIcon /> : <MenuIcon />}
  </IconButton>
);
