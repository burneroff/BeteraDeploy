import { useMediaQuery, useTheme } from '@mui/material';
import LogoDesktop from '@/shared/components/Logo/assets/Logo';

export const useResponsiveLogo = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const LogoComponent =  LogoDesktop;
    const logoSize =  isMobile? 120 : 155;

    return { LogoComponent, logoSize };
};

