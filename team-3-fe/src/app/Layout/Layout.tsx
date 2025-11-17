import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import theme from '../theme/theme';
import { Header } from '@/widgets/Header/ui/Header.tsx';
import { Sidebar } from '@/widgets/Sidebar';
import { useAuthStore } from '@/entities/user/model/store.ts';
import { useMe } from '@/shared/queries';

export const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
  const handleCloseSidebar = () => setSidebarOpen(false);
  const { user, isError } = useMe();
  const { setUser, logout } = useAuthStore();

  // 👇 Синхронизируем React Query с Zustand
  useEffect(() => {
    if (user) setUser(user);
    else if (isError) logout();
  }, [user, isError, setUser, logout]);

  return (
    <Grid
      container
      sx={{
        padding: '0px 40px',
        height: '100vh',
        [theme.breakpoints.down(1350)]: {
          padding: '0px 20px',
        },
      }}
    >
      <Grid size={12} height={'fit-content'}>
        <Header isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />
      </Grid>
      <Grid
        size={2}
        sx={{
          [theme.breakpoints.down(1350)]: {
            height: '0vh',
          },
          [theme.breakpoints.up(1350)]: {
            height: '92vh',
          },
        }}
      >
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </Grid>
      <Grid
        height={'fit-content'}
        size={{ xs: 12, sm: 12, md: 10 }}
        sx={{
          [theme.breakpoints.down(1350)]: {
            flexBasis: '100%',
            maxWidth: '100%',
            paddingTop: '0px',
            paddingLeft: '0px',
          },
        }}
      >
        <main>
          <Outlet />
        </main>
      </Grid>
    </Grid>
  );
};
