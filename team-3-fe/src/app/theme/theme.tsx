import { createTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import '@/app/styles/fonts.css';
import '@/app/styles/variables.css';
import '@mui/material/IconButton';
import { tokens } from '@/shared/theme/tokens';

const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      sidebarLinie: SxProps<Theme>;
      accordionTabDocuments: {
        textField: SxProps<Theme> | undefined;
        container: SxProps<Theme>;
        editBox: SxProps<Theme>;
      };
      categoryListItem: SxProps<Theme>;
      categoryBox: SxProps<Theme>;
      userAvatarBox?: SxProps<Theme>;
    };
  }
  interface ThemeOptions {
    custom?: {
      sidebarLinie?: SxProps<Theme>;
      accordionTabDocuments?: {
        container?: SxProps<Theme>;
        editBox?: SxProps<Theme>;
        textField?: SxProps<Theme>;
      };
      categoryListItem?: SxProps<Theme>;
      categoryBox: SxProps<Theme>;
      userAvatarBox?: SxProps<Theme>;
    };
  }
}

let theme = createTheme({
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: {
      fontSize: 'var(--heading-1-size)',
      lineHeight: 'var(--heading-1-line-height)',
      fontWeight: 'var(--heading-1-font-weight)',
      fontFamily: 'var(--heading-font-family)',
    },
    h2: {
      fontSize: 'var(--heading-2-size)',
      lineHeight: 'var(--heading-2-line-height)',
      fontWeight: 'var(--heading-2-font-weight)',
      fontFamily: 'var(--heading-font-family)',
    },
    h3: {
      fontSize: 'var(--heading-3-size)',
      lineHeight: 'var(--heading-3-line-height)',
      fontWeight: 'var(--heading-3-font-weight)',
      fontFamily: 'var(--heading-font-family)',
    },
    body1: {
      fontSize: 'var(--body-m-size)',
      lineHeight: 'var(--body-m-line-height)',
      fontWeight: 'var(--body-m-font-weight)',
    },
    body2: {
      fontSize: 'var(--body-s-size)',
      lineHeight: 'var(--body-s-line-height)',
      fontWeight: 'var(--body-s-font-weight)',
    },
    button: {
      fontSize: 'var(--body-s-size)',
      lineHeight: 'var(--body-s-line-height)',
      fontWeight: 'var(--body-s-font-weight)',
    },
  },
  palette: {
    mode: prefersDarkMode ? 'dark' : 'light',
    primary: {
      main: tokens.primary[100],
      dark: tokens.primary[200],
      contrastText: tokens.text.light,
    },
    secondary: {
      main: tokens.secondary[100],
      dark: tokens.secondary[200],
    },
    error: {
      main: tokens.status.error,
      dark: tokens.status.errorDark,
    },
    success: {
      main: tokens.status.success,
    },
    warning: {
      main: tokens.status.attention,
    },
    info: {
      main: tokens.status.info,
    },
    text: {
      primary: tokens.text.dark,
      secondary: tokens.text.soft,
      disabled: tokens.text.disabledDark,
    },
    divider: tokens.divider.default,
    background: {
      default: tokens.background.surface,
      paper: tokens.background.surface1,
    },
  },
  // 🔹 Кастомные блоки для Box и AccordionTabDocuments
  custom: {
    sidebarLinie: {
      position: 'absolute',
      left: 0,
      width: '2px',
      height: '36px',
      backgroundColor: 'var(--accent-active)',
      transition: 'top 0.3s ease',
      zIndex: 1,
    },
    accordionTabDocuments: {
      container: {
        '& .MuiAccordionSummary-content': {
          fontWeight: 500,
        },
        '& svg': {
          color: '#221E1C',
        },
        '& .Mui-expanded svg': {
          color: 'var(--primary-300)',
        },
      },
      editBox: {
        display: 'flex',
        gap: '8px',
        paddingLeft: '16px',
        paddingTop: '4px',
        maxHeight: '36px',
      },
      textField: {
        height: '',
        fontSize: '14px',
      },
    },
    categoryListItem: {
      fontSize: '14px',
      pl: '16px',
      pt: 0,
      pb: '12px',
      transition: 'color 0.2s ease',
      '&:hover': {
        color: '#3F41D6',
      },
    },
    categoryBox: {
      display: 'flex',
      gap: 1,
      pl: '16px',
      pt: '4px',
      maxHeight: '36px',
    },
    userAvatarBox: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: '12px',
      fontWeight: '400',
      backgroundColor: (theme: Theme) => theme.palette.secondary.main,
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&:hover': {
        backgroundColor: 'var(--secondary-hover)',
        color: (theme: Theme) => theme.palette.secondary.contrastText,
      },
      '&.Mui-focusVisible': {
        backgroundColor: 'var(--secondary-focus)',
        color: (theme: Theme) => theme.palette.secondary.contrastText,
      },
      '&:active': {
        backgroundColor: 'var(--secondary-active)',
        color: (theme: Theme) => theme.palette.secondary.contrastText,
      },
      '&.Mui-disabled': {
        backgroundColor: 'var(--secondary-disabled)',
        color: (theme: Theme) => theme.palette.text.disabled,
      },
      '& .MuiButton-root': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        minWidth: 40,

        height: '100%',
        color: (theme: Theme) => theme.palette.secondary.contrastText,
      },

      '& .MuiAvatar-root': {
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFamily: '"Roboto", sans-serif' },

        // 🔹 Стилизация скроллбара (универсально для всех направлений)
        '*::-webkit-scrollbar': {
          width: '4px', // <-- вертикальный
          height: '4px', // <-- горизонтальный
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: '#FFF',
          borderRadius: '8px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#CFD5EC',
          borderRadius: '8px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#B5BFE3',
        },
        '*::-webkit-scrollbar-button': {
          display: 'none',
        },

        // 🔹 Остальные стили
        '&.header-left': {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 12,
        },
        '&.header-right': {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          width: 'auto',
          gap: 10,
        },
        '.MuiModal-root.MuiDrawer-root': {
          zIndex: 3,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          '&:hover .MuiAccordionSummary-content': {
            color: 'var(--primary-300)',
          },
        },
        content: {
          bgColor: 'transparent',
          fontWeight: 500,
          color: '#16122C',
          '&.Mui-expanded': {
            color: 'var(--primary-300)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingTop: 0,
          paddingBottom: '12px',
          fontSize: 14,
          '&:hover': {
            color: '#3F41D6',
          },
        },
      },
    },
    // Drawer (Sidebar)
    MuiDrawer: {
      styleOverrides: {
        root: {
          height: '100%',
        },
        paper: ({ theme }) => ({
          width: 'auto',
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: '#ffffff',
          position: 'relative',
          height: '100%',
          zIndex: 2,
          paddingTop: '20px',
          [theme.breakpoints.down(1350)]: {
            position: 'fixed',
            padding: '16px 20px 0px',
            width: '100%',
            maxWidth: '322px',
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
            height: '100%',
          },
        }),
      },
    },
    // Tabs (Sidebar navigation)
    MuiTabs: {
      styleOverrides: {
        root: {
          width: '100%',
          minHeight: 'max-content',
        },
        indicator: {
          display: 'none',
        },
      },
    },
    // Tab (Sidebar navigation)
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          textAlign: 'left',
          justifyContent: 'flex-start',
          textTransform: 'none',
          fontWeight: 500,
          opacity: 1,
          paddingLeft: '16px',
          minHeight: 36,
          maxHeight: 36,
          paddingTop: '4px',
          paddingBottom: '12px',
          color: '#16122C',
          '&:hover': {
            color: '#4C4DD6',
            '& svg': { color: '#4C4DD6' },
          },
          '&.Mui-selected': {
            color: '#3F41D6',
            '& svg': { color: '#3F41D6' },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: () => ({
          '&.header': {
            height: 56,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            width: '100%',
            left: 0,
            zIndex: 4,
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: () => ({
          borderRadius: 24, // 🔹 скругление окна
          padding: 32,
          [theme.breakpoints.down(1350)]: {
            padding: 24,
          },
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: 0, // убираем padding для заголовка
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 0,
          marginTop: 20,
          marginBottom: 24,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: 0, // убираем padding для действий (кнопок)
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '12px', // 🔹 скругление всего меню
          padding: '8px', // 🔹 внутренние отступы вокруг элементов
        },
        list: {
          padding: '0px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 36,
          fontSize: '14px',
          borderRadius: '8px', // 🔹 скругляем углы
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: '#E8E8FF', // 🔹 цвет при наведении
          },
          '&.Mui-selected': {
            backgroundColor: '#E8E8FF', // 🔹 цвет выбранного
            '&:hover': {
              backgroundColor: '#E8E8FF', // 🔹 не меняется при hover
            },
          },
        },
      },
    },
    // Button
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          height: '100%',
        },
      },
    },
    // OutlinedInput
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          height: 36,
          fontSize: 14,
          '& .MuiOutlinedInput-input': { padding: '9px 12px' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8E8FF' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--primary-300)',
            borderWidth: 2,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4C4DD6' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: () => ({
          color: '#16122C66',
          transition: 'color 0.25s ease, transform 0.25s ease',
          minWidth: '162px',
          top: '-2px', // смещаем вверх или вниз
          '&.Mui-focused': { color: 'var(--primary-300)' },
          '&.MuiInputLabel-shrink': {
            color: '#413B65',
            transform: 'translate(12px, -8px) scale(0.7)', // ⬅️ чуть выше
          },
          '&.MuiInputLabel-shrink.Mui-focused': { color: 'var(--primary-300)' },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          position: 'absolute',
          transform: 'translateY(175%)',
          left: '-2px',
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true, // отключает эффект нажатия
      },
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'transparent !important',
          },
          '&.MuiCheckbox-root:not(.Mui-checked):not(.MuiCheckbox-indeterminate):not(.Mui-disabled) .MuiSvgIcon-root':
            {
              width: 18,
              height: 18,
              backgroundColor: '#E8E8FF', // фон квадрата
              borderRadius: '2px',
              boxSizing: 'border-box', // рамка включена в размер
              padding: 0, // чтобы фон не выходил
              overflow: 'hidden', // обрезает всё лишнее
              backgroundClip: 'padding-box', // гарантирует, что фон не выходит за рамку
            },
          '&.MuiCheckbox-root:not(.Mui-checked):not(.MuiCheckbox-indeterminate):not(.Mui-disabled) .MuiSvgIcon-root path':
            {
              fill: '#E8E8FF', // перекрашиваем внутренние path
            },
        },
      },
    },
  },
});

theme = createTheme(theme, {
  typography: {
    h1: {
      [theme.breakpoints.up('sm')]: {
        fontSize: 'clamp(1.375rem, 0.55rem + 1.718vi, 2rem)',
      },
    },
  },
});
export default theme;
