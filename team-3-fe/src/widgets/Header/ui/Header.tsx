import { Logo } from '@/shared/components/Logo';
import { RoleLabel } from '@/entities/user/role-label';
import { UserAvatar } from '@/entities/user/user-avatar';
import Box from '@mui/material/Box';

import { BurgerButton } from '@/shared/components/BurgerButton/BurgerButton';
import { AppBar, useMediaQuery } from '@mui/material';
import theme from '@/app/theme/theme';

export const Header = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const isDesktop = useMediaQuery(theme.breakpoints.up(1350));

  return (
    <AppBar className="header" elevation={0} position={"static"}>
      <Box className="header-left">
        {!isDesktop && <BurgerButton isOpen={isOpen} onClick={onToggle} />}
        {isDesktop && <Logo />}
      </Box>
      <Box className="header-right">
        <RoleLabel />
        <UserAvatar />
      </Box>
    </AppBar>
  );
};
