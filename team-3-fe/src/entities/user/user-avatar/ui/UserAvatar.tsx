import { Avatar, Menu, MenuItem, Button, Typography, ListItemIcon, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@/shared/icons/LogoutIcon';
import SettingIcon from '@/shared/icons/SettingIcon';
import theme from '@/app/theme/theme';
import { useAuthStore } from '../../model/store';
import { useLogout } from '@/shared/queries';
 

// ---------------------- styled ----------------------
export const MenuTypography = styled(Typography)(() => ({
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '18px',
}));

// ---------------------- component ----------------------
export const UserAvatar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { mutateAsync: logout, isPending } = useLogout();

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseMenu();
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleCloseMenu();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      handleCloseMenu();
      navigate('/login');
    }
  };

  // ---------------------- UI ----------------------
  return (
    <Box sx={theme.custom.userAvatarBox}>
      <Button onClick={handleOpenMenu}>
        <Avatar
          src={user?.photoPath}
          alt={'userImage'}
          variant={'rounded'}
          sx={{
            background: 'transparent',
            borderRadius: '12px',
            color: 'var(--text-dark)',
            fontSize: '14px',
            lineHeight: '18px',
            fontWeight: '400',
          }}
        >
          {!user?.photoPath && user?.initials}
        </Avatar>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 230,
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '2px 2px 10px 0px #36322F1A',
          },
        }}
      >
        <MenuItem onClick={() => handleNavigate('/profile')}>
          <ListItemIcon>
            <SettingIcon />
          </ListItemIcon>
          <MenuTypography>Настройки</MenuTypography>
        </MenuItem>

        <MenuItem onClick={handleLogout} disabled={isPending}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <MenuTypography>{isPending ? 'Выходим…' : 'Выйти'}</MenuTypography>
        </MenuItem>
      </Menu>
    </Box>
  );
};
